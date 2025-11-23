// utils/unitConverter.js

// Unit conversion rates (all converted to base unit)
const UNIT_CONVERSIONS = {
  // Volume - base unit: ml
  volume: {
    ml: 1,
    milliliter: 1,
    millilitre: 1,
    l: 1000,
    liter: 1000,
    litre: 1000,
    tsp: 4.92892,
    teaspoon: 4.92892,
    tbsp: 14.7868,
    tablespoon: 14.7868,
    'fl oz': 29.5735,
    'fluid ounce': 29.5735,
    cup: 236.588,
    c: 236.588,
    pint: 473.176,
    pt: 473.176,
    quart: 946.353,
    qt: 946.353,
    gallon: 3785.41,
    gal: 3785.41
  },

  // Weight - base unit: g
  weight: {
    mg: 0.001,
    milligram: 0.001,
    g: 1,
    gram: 1,
    kg: 1000,
    kilogram: 1000,
    oz: 28.3495,
    ounce: 28.3495,
    lb: 453.592,
    pound: 453.592
  },

  // Count - base unit: piece
  count: {
    '': 1, // Empty string maps to count
    piece: 1,
    pc: 1,
    item: 1,
    whole: 1,
    clove: 1,
    stick: 1,
    slice: 1,
    can: 1,
    package: 1,
    pkg: 1,
    bag: 1,
    box: 1,
    bunch: 1,
    head: 1,
    stalk: 1
  }
};

// Parse quantity string that might contain fractions
export const parseQuantity = (quantityInput) => {
  if (typeof quantityInput === 'number') {
    return quantityInput;
  }

  const quantity = String(quantityInput).trim();

  if (!quantity || quantity === '') {
    return 0;
  }

  // Handle fractions like "1/2", "1/4", "3/4"
  if (quantity.includes('/')) {
    const parts = quantity.split(' ');
    let total = 0;

    parts.forEach(part => {
      if (part.includes('/')) {
        const [num, den] = part.split('/').map(n => parseFloat(n));
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          total += num / den;
        }
      } else {
        const num = parseFloat(part);
        if (!isNaN(num)) {
          total += num;
        }
      }
    });

    return total;
  }

  // Handle unicode fractions
  const unicodeFractions = {
    '⅛': 0.125,
    '¼': 0.25,
    '⅓': 0.333,
    '½': 0.5,
    '⅔': 0.667,
    '¾': 0.75
  };

  let result = 0;
  let workingStr = quantity;

  // Extract unicode fractions
  for (const [frac, value] of Object.entries(unicodeFractions)) {
    if (workingStr.includes(frac)) {
      result += value;
      workingStr = workingStr.replace(frac, '');
    }
  }

  // Add any remaining number
  const remaining = parseFloat(workingStr.trim());
  if (!isNaN(remaining)) {
    result += remaining;
  }

  return result || 0;
};

// Normalize unit string
export const normalizeUnit = (unit) => {
  if (!unit || unit === null || unit === undefined) {
    return '';
  }
  return String(unit).toLowerCase().trim();
};

// Determine which category a unit belongs to
export const getUnitCategory = (unit) => {
  const normalizedUnit = normalizeUnit(unit);

  for (const [category, units] of Object.entries(UNIT_CONVERSIONS)) {
    if (units[normalizedUnit] !== undefined) {
      return category;
    }
  }

  return 'count'; // Default to count if unknown
};

// Get conversion rate for a unit
const getConversionRate = (unit) => {
  const normalizedUnit = normalizeUnit(unit);
  const category = getUnitCategory(unit);

  return UNIT_CONVERSIONS[category][normalizedUnit] || 1;
};

// Convert quantity from one unit to another
export const convertUnit = (quantity, fromUnit, toUnit) => {
  const parsedQuantity = parseQuantity(quantity);
  const normalizedFromUnit = normalizeUnit(fromUnit);
  const normalizedToUnit = normalizeUnit(toUnit);

  if (normalizedFromUnit === normalizedToUnit) {
    return parsedQuantity;
  }

  const fromCategory = getUnitCategory(normalizedFromUnit);
  const toCategory = getUnitCategory(normalizedToUnit);

  // Can't convert between different categories
  if (fromCategory !== toCategory) {
    return null;
  }

  const fromRate = getConversionRate(normalizedFromUnit);
  const toRate = getConversionRate(normalizedToUnit);

  // Convert to base unit, then to target unit
  const baseValue = parsedQuantity * fromRate;
  return baseValue / toRate;
};

// Check if two units are compatible for conversion
export const areUnitsCompatible = (unit1, unit2) => {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);

  // Empty units are always compatible with count
  if (!norm1 || !norm2) return true;

  return getUnitCategory(norm1) === getUnitCategory(norm2);
};

// Get the preferred unit for display (most common/readable)
export const getPreferredUnit = (quantity, unit, category) => {
  const parsedQuantity = parseQuantity(quantity);
  const normalizedUnit = normalizeUnit(unit);
  const unitCategory = category || getUnitCategory(normalizedUnit);

  if (unitCategory === 'volume') {
    const mlValue = parsedQuantity * (getConversionRate(normalizedUnit) || 1);

    if (mlValue >= 3785) return { quantity: mlValue / 3785.41, unit: 'gallon' };
    if (mlValue >= 946) return { quantity: mlValue / 946.353, unit: 'quart' };
    if (mlValue >= 473) return { quantity: mlValue / 473.176, unit: 'pint' };
    if (mlValue >= 236) return { quantity: mlValue / 236.588, unit: 'cup' };
    if (mlValue >= 29.5) return { quantity: mlValue / 29.5735, unit: 'fl oz' };
    if (mlValue >= 14.7) return { quantity: mlValue / 14.7868, unit: 'tbsp' };
    if (mlValue >= 4.9) return { quantity: mlValue / 4.92892, unit: 'tsp' };
    return { quantity: mlValue, unit: 'ml' };
  }

  if (unitCategory === 'weight') {
    const gValue = parsedQuantity * (getConversionRate(normalizedUnit) || 1);

    if (gValue >= 453.592) return { quantity: gValue / 453.592, unit: 'lb' };
    if (gValue >= 28.3495) return { quantity: gValue / 28.3495, unit: 'oz' };
    if (gValue >= 1000) return { quantity: gValue / 1000, unit: 'kg' };
    if (gValue >= 1) return { quantity: gValue, unit: 'g' };
    return { quantity: gValue * 1000, unit: 'mg' };
  }

  // For count, just return as-is
  return { quantity: parsedQuantity, unit: normalizedUnit || 'piece' };
};

// Normalize ingredient name for comparison
export const normalizeIngredientName = (name) => {
  if (!name) return '';

  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Remove common adjectives that shouldn't affect grouping
    .replace(/\b(fresh|dried|frozen|chopped|diced|minced|sliced|whole|ground)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Consolidate duplicate ingredients
export const consolidateIngredients = (items) => {
  const consolidated = {};

  items.forEach(item => {
    const normalizedName = normalizeIngredientName(item.name);
    const parsedQty = parseQuantity(item.quantity);
    const unit = normalizeUnit(item.unit);
    const category = getUnitCategory(unit);

    // Create a key based on normalized name
    const key = normalizedName;

    if (!consolidated[key]) {
      consolidated[key] = {
        ...item,
        quantity: parsedQty,
        unit: unit,
        normalizedName,
        unitCategory: category,
        originalUnits: [{ quantity: parsedQty, unit: unit }],
        firstSeenUnit: unit, // Track the first unit we see
        variants: [] // Track incompatible variants
      };
    } else {
      // Check if units are compatible
      const existingUnit = consolidated[key].unit;

      if (areUnitsCompatible(existingUnit, unit)) {
        // Convert and add quantities using the FIRST SEEN unit
        const firstUnit = consolidated[key].firstSeenUnit;
        const convertedQty = convertUnit(parsedQty, unit, firstUnit);

        if (convertedQty !== null) {
          consolidated[key].quantity = parseFloat(consolidated[key].quantity) + parseFloat(convertedQty);
          consolidated[key].unit = firstUnit; // Keep first seen unit
          consolidated[key].originalUnits.push({ quantity: parsedQty, unit: unit });
        } else {
          // Should not happen if areUnitsCompatible is true, but fallback just in case
          consolidated[key].variants.push({ quantity: parsedQty, unit: unit });
        }
      } else {
        // Different unit categories - ADD TO VARIANTS instead of separate key
        consolidated[key].variants.push({ quantity: parsedQty, unit: unit });
        consolidated[key].originalUnits.push({ quantity: parsedQty, unit: unit });
      }

      // Merge usedInMeals arrays
      if (item.usedInMeals && consolidated[key]) {
        consolidated[key].usedInMeals = [
          ...new Set([
            ...(consolidated[key].usedInMeals || []),
            ...item.usedInMeals
          ])
        ];
      }
    }
  });

  // Convert to array and format display
  return Object.values(consolidated).map(item => {
    // Format the main quantity
    let displayQty = formatQuantity(item.quantity);
    if (item.unit) displayQty += ` ${item.unit}`;

    // Append variants if any
    if (item.variants && item.variants.length > 0) {
      const variantStrings = item.variants.map(v =>
        `${formatQuantity(v.quantity)} ${v.unit || ''}`.trim()
      );
      displayQty += ` + ${variantStrings.join(' + ')}`;
    }

    return {
      ...item,
      quantity: Math.round(item.quantity * 100) / 100, // Round to 2 decimals
      displayQuantity: displayQty
    };
  });
};

// Format quantity for display (handle fractions)
export const formatQuantity = (quantity) => {
  const parsedQty = parseQuantity(quantity);
  const rounded = Math.round(parsedQty * 100) / 100;

  // Convert to fractions for common cooking measurements
  const fractions = {
    0.125: '⅛',
    0.25: '¼',
    0.33: '⅓',
    0.333: '⅓',
    0.5: '½',
    0.67: '⅔',
    0.667: '⅔',
    0.75: '¾'
  };

  const whole = Math.floor(rounded);
  const decimal = rounded - whole;

  // Check if decimal part matches a common fraction (within 0.02 tolerance)
  for (const [dec, frac] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(dec)) < 0.02) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  return rounded.toString();
};

// Get all units in a category for selection
export const getUnitsInCategory = (category) => {
  const units = Object.keys(UNIT_CONVERSIONS[category] || {});
  // Filter out empty string from display
  return units.filter(u => u !== '');
};

// Get all available unit categories
export const getUnitCategories = () => {
  return Object.keys(UNIT_CONVERSIONS);
};

export default {
  convertUnit,
  areUnitsCompatible,
  getPreferredUnit,
  normalizeIngredientName,
  consolidateIngredients,
  formatQuantity,
  getUnitCategory,
  getUnitsInCategory,
  getUnitCategories,
  parseQuantity,
  normalizeUnit
};