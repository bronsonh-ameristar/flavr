// server/src/utils/unitConverter.js
// Server-side port of unit converter for ingredient consolidation

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
    '': 1,
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
const parseQuantity = (quantityInput) => {
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

  for (const [frac, value] of Object.entries(unicodeFractions)) {
    if (workingStr.includes(frac)) {
      result += value;
      workingStr = workingStr.replace(frac, '');
    }
  }

  const remaining = parseFloat(workingStr.trim());
  if (!isNaN(remaining)) {
    result += remaining;
  }

  return result || 0;
};

// Normalize unit string
const normalizeUnit = (unit) => {
  if (!unit || unit === null || unit === undefined) {
    return '';
  }
  return String(unit).toLowerCase().trim();
};

// Determine which category a unit belongs to
const getUnitCategory = (unit) => {
  const normalizedUnit = normalizeUnit(unit);

  for (const [category, units] of Object.entries(UNIT_CONVERSIONS)) {
    if (units[normalizedUnit] !== undefined) {
      return category;
    }
  }

  return 'count';
};

// Get conversion rate for a unit
const getConversionRate = (unit) => {
  const normalizedUnit = normalizeUnit(unit);
  const category = getUnitCategory(unit);

  return UNIT_CONVERSIONS[category][normalizedUnit] || 1;
};

// Convert quantity from one unit to another
const convertUnit = (quantity, fromUnit, toUnit) => {
  const parsedQuantity = parseQuantity(quantity);
  const normalizedFromUnit = normalizeUnit(fromUnit);
  const normalizedToUnit = normalizeUnit(toUnit);

  if (normalizedFromUnit === normalizedToUnit) {
    return parsedQuantity;
  }

  const fromCategory = getUnitCategory(normalizedFromUnit);
  const toCategory = getUnitCategory(normalizedToUnit);

  if (fromCategory !== toCategory) {
    return null;
  }

  const fromRate = getConversionRate(normalizedFromUnit);
  const toRate = getConversionRate(normalizedToUnit);

  const baseValue = parsedQuantity * fromRate;
  return baseValue / toRate;
};

// Check if two units are compatible for conversion
const areUnitsCompatible = (unit1, unit2) => {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);

  if (!norm1 || !norm2) return true;

  return getUnitCategory(norm1) === getUnitCategory(norm2);
};

// Normalize ingredient name for comparison
const normalizeIngredientName = (name) => {
  if (!name) return '';

  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(fresh|dried|frozen|chopped|diced|minced|sliced|whole|ground)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Format quantity for display (handle fractions)
const formatQuantity = (quantity) => {
  const parsedQty = parseQuantity(quantity);
  const rounded = Math.round(parsedQty * 100) / 100;

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

  for (const [dec, frac] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(dec)) < 0.02) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  return rounded.toString();
};

// Consolidate duplicate ingredients with scaling support
const consolidateIngredients = (items) => {
  const consolidated = {};

  items.forEach(item => {
    const normalizedName = normalizeIngredientName(item.name);
    const parsedQty = parseQuantity(item.quantity);
    const unit = normalizeUnit(item.unit);
    const category = getUnitCategory(unit);

    const key = normalizedName;

    if (!consolidated[key]) {
      consolidated[key] = {
        name: item.name,
        quantity: parsedQty,
        unit: unit,
        category: item.category || 'other',
        normalizedName,
        unitCategory: category,
        originalUnits: [{ quantity: parsedQty, unit: unit }],
        firstSeenUnit: unit,
        variants: [],
        usedInMeals: item.usedInMeals || []
      };
    } else {
      const existingUnit = consolidated[key].unit;

      if (areUnitsCompatible(existingUnit, unit)) {
        const firstUnit = consolidated[key].firstSeenUnit;
        const convertedQty = convertUnit(parsedQty, unit, firstUnit);

        if (convertedQty !== null) {
          consolidated[key].quantity = parseFloat(consolidated[key].quantity) + parseFloat(convertedQty);
          consolidated[key].unit = firstUnit;
          consolidated[key].originalUnits.push({ quantity: parsedQty, unit: unit });
        } else {
          consolidated[key].variants.push({ quantity: parsedQty, unit: unit });
        }
      } else {
        consolidated[key].variants.push({ quantity: parsedQty, unit: unit });
        consolidated[key].originalUnits.push({ quantity: parsedQty, unit: unit });
      }

      if (item.usedInMeals) {
        consolidated[key].usedInMeals = [
          ...new Set([
            ...(consolidated[key].usedInMeals || []),
            ...item.usedInMeals
          ])
        ];
      }
    }
  });

  return Object.values(consolidated).map(item => {
    let displayQty = formatQuantity(item.quantity);
    if (item.unit) displayQty += ` ${item.unit}`;

    if (item.variants && item.variants.length > 0) {
      const variantStrings = item.variants.map(v =>
        `${formatQuantity(v.quantity)} ${v.unit || ''}`.trim()
      );
      displayQty += ` + ${variantStrings.join(' + ')}`;
    }

    return {
      name: item.name,
      quantity: formatQuantity(item.quantity),
      unit: item.unit || '',
      category: item.category,
      displayQuantity: displayQty,
      usedInMeals: item.usedInMeals
    };
  });
};

// Scale ingredient quantity by a ratio
const scaleQuantity = (quantity, ratio) => {
  const parsedQty = parseQuantity(quantity);
  return parsedQty * ratio;
};

module.exports = {
  parseQuantity,
  normalizeUnit,
  getUnitCategory,
  convertUnit,
  areUnitsCompatible,
  normalizeIngredientName,
  formatQuantity,
  consolidateIngredients,
  scaleQuantity,
  UNIT_CONVERSIONS
};