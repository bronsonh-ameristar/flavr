const { MealPlanTemplate, MealPlanTemplateItem, Meal, MealPlan } = require('../../models');
const { Op } = require('sequelize');

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

class MealPlanTemplatesController {
  // Get all templates for the current user
  static async getTemplates(req, res) {
    try {
      const userId = req.userId;

      const templates = await MealPlanTemplate.findAll({
        where: { userId },
        include: [{
          model: MealPlanTemplateItem,
          as: 'items',
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl']
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        templates,
        count: templates.length
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  // Get a single template by ID
  static async getTemplate(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const template = await MealPlanTemplate.findOne({
        where: { id, userId },
        include: [{
          model: MealPlanTemplateItem,
          as: 'items',
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl', 'prepTime', 'cookTime']
          }]
        }]
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ template });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  }

  // Create a new template
  static async createTemplate(req, res) {
    try {
      const userId = req.userId;
      const { name, items } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Template name is required' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Template must have at least one item' });
      }

      // Create the template
      const template = await MealPlanTemplate.create({
        userId,
        name
      });

      // Create the template items
      const itemPromises = items.map(item =>
        MealPlanTemplateItem.create({
          templateId: template.id,
          mealId: item.mealId,
          dayOfWeek: item.dayOfWeek,
          mealType: item.mealType
        })
      );

      await Promise.all(itemPromises);

      // Fetch complete template with items
      const completeTemplate = await MealPlanTemplate.findByPk(template.id, {
        include: [{
          model: MealPlanTemplateItem,
          as: 'items',
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl']
          }]
        }]
      });

      res.status(201).json({ template: completeTemplate });
    } catch (error) {
      console.error('Error creating template:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  // Update a template
  static async updateTemplate(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { name, items } = req.body;

      const template = await MealPlanTemplate.findOne({
        where: { id, userId }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Update template name if provided
      if (name) {
        await template.update({ name });
      }

      // Update items if provided
      if (items && Array.isArray(items)) {
        // Delete existing items
        await MealPlanTemplateItem.destroy({
          where: { templateId: id }
        });

        // Create new items
        const itemPromises = items.map(item =>
          MealPlanTemplateItem.create({
            templateId: id,
            mealId: item.mealId,
            dayOfWeek: item.dayOfWeek,
            mealType: item.mealType
          })
        );

        await Promise.all(itemPromises);
      }

      // Fetch updated template
      const updatedTemplate = await MealPlanTemplate.findByPk(id, {
        include: [{
          model: MealPlanTemplateItem,
          as: 'items',
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl']
          }]
        }]
      });

      res.json({ template: updatedTemplate });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  // Delete a template
  static async deleteTemplate(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const deletedCount = await MealPlanTemplate.destroy({
        where: { id, userId }
      });

      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  // Apply a template to a week starting at startDate
  static async applyTemplate(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { startDate, overwrite = false } = req.body;

      if (!startDate) {
        return res.status(400).json({ error: 'startDate is required' });
      }

      // Get the template with items
      const template = await MealPlanTemplate.findOne({
        where: { id, userId },
        include: [{
          model: MealPlanTemplateItem,
          as: 'items'
        }]
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (!template.items || template.items.length === 0) {
        return res.json({
          message: 'Template has no items to apply',
          created: 0,
          updated: 0,
          skipped: 0
        });
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;

      // Calculate dates based on startDate and dayOfWeek
      const weekStart = new Date(startDate + 'T00:00:00');

      for (const item of template.items) {
        const targetDate = new Date(weekStart);
        targetDate.setDate(weekStart.getDate() + item.dayOfWeek);
        const dateStr = formatLocalDate(targetDate);

        // Check if meal plan already exists
        const existing = await MealPlan.findOne({
          where: {
            userId,
            date: dateStr,
            mealType: item.mealType
          }
        });

        if (existing) {
          if (overwrite) {
            await existing.update({ mealId: item.mealId });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await MealPlan.create({
            userId,
            mealId: item.mealId,
            date: dateStr,
            mealType: item.mealType
          });
          created++;
        }
      }

      res.json({
        message: `Template applied: ${created} created, ${updated} updated, ${skipped} skipped`,
        created,
        updated,
        skipped
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ error: 'Failed to apply template' });
    }
  }
}

module.exports = MealPlanTemplatesController;
