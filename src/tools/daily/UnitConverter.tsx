import { useState, useMemo } from 'react';
import {
  Ruler,
  Scale,
  Droplets,
  Thermometer,
  Maximize2,
  Gauge,
  Compass,
  HardDrive,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export type CategoryKey =
  | 'length'
  | 'weight'
  | 'volume'
  | 'temperature'
  | 'area'
  | 'speed'
  | 'pressure'
  | 'digital';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  system: 'metric' | 'imperial' | 'us' | 'si' | 'binary' | 'other';
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
  formulaDescription?: (fromSymbol: string, toSymbol: string) => string;
}

export interface CategoryConfig {
  id: CategoryKey;
  name: string;
  description: string;
  icon: typeof Ruler;
  defaultFrom: string;
  defaultTo: string;
  units: UnitDefinition[];
  presets: { label: string; value: string; from: string; to: string }[];
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  length: {
    id: 'length',
    name: 'Length',
    description: 'Distance, height, width, and span units',
    icon: Ruler,
    defaultFrom: 'm',
    defaultTo: 'ft',
    presets: [
      { label: '1 m → ft', value: '1', from: 'm', to: 'ft' },
      { label: '1 km → mi', value: '1', from: 'km', to: 'mi' },
      { label: '6 ft → cm', value: '6', from: 'ft', to: 'cm' },
      { label: '1 in → cm', value: '1', from: 'in', to: 'cm' },
      { label: '100 yd → m', value: '100', from: 'yd', to: 'm' },
    ],
    units: [
      { id: 'km', name: 'Kilometers', symbol: 'km', system: 'metric', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'm', name: 'Meters', symbol: 'm', system: 'si', toBase: v => v, fromBase: v => v },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', system: 'metric', toBase: v => v * 0.01, fromBase: v => v / 0.01 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', system: 'metric', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { id: 'um', name: 'Micrometers', symbol: 'µm', system: 'metric', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'nm', name: 'Nanometers', symbol: 'nm', system: 'metric', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
      { id: 'mi', name: 'Miles', symbol: 'mi', system: 'imperial', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      { id: 'yd', name: 'Yards', symbol: 'yd', system: 'imperial', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { id: 'ft', name: 'Feet', symbol: 'ft', system: 'imperial', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: 'in', name: 'Inches', symbol: 'in', system: 'imperial', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'nmi', system: 'other', toBase: v => v * 1852, fromBase: v => v / 1852 },
    ]
  },
  weight: {
    id: 'weight',
    name: 'Weight & Mass',
    description: 'Weight, mass, bulk chemical, and everyday loads',
    icon: Scale,
    defaultFrom: 'kg',
    defaultTo: 'lb',
    presets: [
      { label: '1 kg → lb', value: '1', from: 'kg', to: 'lb' },
      { label: '70 kg → lb', value: '70', from: 'kg', to: 'lb' },
      { label: '1 lb → g', value: '1', from: 'lb', to: 'g' },
      { label: '1 oz → g', value: '1', from: 'oz', to: 'g' },
      { label: '1 t → kg', value: '1', from: 't', to: 'kg' },
    ],
    units: [
      { id: 't', name: 'Metric Tons', symbol: 't', system: 'metric', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { id: 'kg', name: 'Kilograms', symbol: 'kg', system: 'si', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'g', name: 'Grams', symbol: 'g', system: 'metric', toBase: v => v, fromBase: v => v },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', system: 'metric', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { id: 'ug', name: 'Micrograms', symbol: 'µg', system: 'metric', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', system: 'imperial', toBase: v => v * 453.59237, fromBase: v => v / 453.59237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', system: 'imperial', toBase: v => v * 28.349523125, fromBase: v => v / 28.349523125 },
      { id: 'st', name: 'Stone', symbol: 'st', system: 'imperial', toBase: v => v * 6350.29318, fromBase: v => v / 6350.29318 },
      { id: 'ct', name: 'Carats', symbol: 'ct', system: 'other', toBase: v => v * 0.2, fromBase: v => v / 0.2 },
    ]
  },
  volume: {
    id: 'volume',
    name: 'Volume & Capacity',
    description: 'Liquid measures, laboratory volumes, and cubic capacities',
    icon: Droplets,
    defaultFrom: 'l',
    defaultTo: 'gal',
    presets: [
      { label: '1 L → gal', value: '1', from: 'l', to: 'gal' },
      { label: '1 gal → L', value: '1', from: 'gal', to: 'l' },
      { label: '500 mL → fl oz', value: '500', from: 'ml', to: 'floz' },
      { label: '1 cup → mL', value: '1', from: 'cup', to: 'ml' },
      { label: '1 m³ → L', value: '1', from: 'm3', to: 'l' },
    ],
    units: [
      { id: 'm3', name: 'Cubic Meters', symbol: 'm³', system: 'si', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'l', name: 'Liters', symbol: 'L', system: 'metric', toBase: v => v, fromBase: v => v },
      { id: 'dl', name: 'Deciliters', symbol: 'dL', system: 'metric', toBase: v => v * 0.1, fromBase: v => v / 0.1 },
      { id: 'cl', name: 'Centiliters', symbol: 'cL', system: 'metric', toBase: v => v * 0.01, fromBase: v => v / 0.01 },
      { id: 'ml', name: 'Milliliters', symbol: 'mL', system: 'metric', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { id: 'ul', name: 'Microliters', symbol: 'µL', system: 'metric', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'cm3', name: 'Cubic Centimeters (cc)', symbol: 'cm³', system: 'metric', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { id: 'gal', name: 'US Gallons', symbol: 'gal', system: 'us', toBase: v => v * 3.785411784, fromBase: v => v / 3.785411784 },
      { id: 'qt', name: 'US Quarts', symbol: 'qt', system: 'us', toBase: v => v * 0.946352946, fromBase: v => v / 0.946352946 },
      { id: 'pt', name: 'US Pints', symbol: 'pt', system: 'us', toBase: v => v * 0.473176473, fromBase: v => v / 0.473176473 },
      { id: 'cup', name: 'US Cups', symbol: 'cup', system: 'us', toBase: v => v * 0.24, fromBase: v => v / 0.24 },
      { id: 'floz', name: 'US Fluid Ounces', symbol: 'fl oz', system: 'us', toBase: v => v * 0.0295735295625, fromBase: v => v / 0.0295735295625 },
      { id: 'tbsp', name: 'US Tablespoons', symbol: 'tbsp', system: 'us', toBase: v => v * 0.01478676478125, fromBase: v => v / 0.01478676478125 },
      { id: 'tsp', name: 'US Teaspoons', symbol: 'tsp', system: 'us', toBase: v => v * 0.00492892159375, fromBase: v => v / 0.00492892159375 },
      { id: 'uk_gal', name: 'UK Imperial Gallons', symbol: 'imp gal', system: 'imperial', toBase: v => v * 4.54609, fromBase: v => v / 4.54609 },
    ]
  },
  temperature: {
    id: 'temperature',
    name: 'Temperature',
    description: 'Thermal scales for science, weather, and laboratory tests',
    icon: Thermometer,
    defaultFrom: 'c',
    defaultTo: 'f',
    presets: [
      { label: '0 °C (Freezing)', value: '0', from: 'c', to: 'f' },
      { label: '37 °C (Body Temp)', value: '37', from: 'c', to: 'f' },
      { label: '100 °C (Boiling)', value: '100', from: 'c', to: 'f' },
      { label: '72 °F (Room Temp)', value: '72', from: 'f', to: 'c' },
      { label: '-40 °C (Parity)', value: '-40', from: 'c', to: 'f' },
      { label: '300 K → °C', value: '300', from: 'k', to: 'c' },
    ],
    units: [
      {
        id: 'c',
        name: 'Celsius',
        symbol: '°C',
        system: 'metric',
        toBase: v => v,
        fromBase: v => v,
        formulaDescription: () => 'Standard Metric base'
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        symbol: '°F',
        system: 'imperial',
        toBase: v => (v - 32) * (5 / 9),
        fromBase: v => (v * (9 / 5)) + 32,
        formulaDescription: (from, to) =>
          from === '°C' ? '°F = (°C × 9/5) + 32' : from === 'K' ? '°F = (K - 273.15) × 9/5 + 32' : 'Direct conversion'
      },
      {
        id: 'k',
        name: 'Kelvin',
        symbol: 'K',
        system: 'si',
        toBase: v => v - 273.15,
        fromBase: v => v + 273.15,
        formulaDescription: (from) => (from === '°C' ? 'K = °C + 273.15' : 'Direct thermodynamic conversion')
      },
      {
        id: 'r',
        name: 'Rankine',
        symbol: '°R',
        system: 'imperial',
        toBase: v => (v - 491.67) * (5 / 9),
        fromBase: v => (v + 273.15) * (9 / 5),
        formulaDescription: () => '°R = (Celsius + 273.15) × 9/5'
      }
    ]
  },
  area: {
    id: 'area',
    name: 'Area',
    description: 'Surface, land measurement, and floor areas',
    icon: Maximize2,
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    presets: [
      { label: '1 m² → ft²', value: '1', from: 'm2', to: 'ft2' },
      { label: '1 ha → ac', value: '1', from: 'ha', to: 'ac' },
      { label: '1 km² → mi²', value: '1', from: 'km2', to: 'mi2' },
      { label: '1000 ft² → m²', value: '1000', from: 'ft2', to: 'm2' },
    ],
    units: [
      { id: 'km2', name: 'Square Kilometers', symbol: 'km²', system: 'metric', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { id: 'ha', name: 'Hectares', symbol: 'ha', system: 'metric', toBase: v => v * 10000, fromBase: v => v / 10000 },
      { id: 'm2', name: 'Square Meters', symbol: 'm²', system: 'si', toBase: v => v, fromBase: v => v },
      { id: 'cm2', name: 'Square Centimeters', symbol: 'cm²', system: 'metric', toBase: v => v * 0.0001, fromBase: v => v / 0.0001 },
      { id: 'ac', name: 'Acres', symbol: 'ac', system: 'imperial', toBase: v => v * 4046.8564224, fromBase: v => v / 4046.8564224 },
      { id: 'mi2', name: 'Square Miles', symbol: 'mi²', system: 'imperial', toBase: v => v * 2589988.110336, fromBase: v => v / 2589988.110336 },
      { id: 'yd2', name: 'Square Yards', symbol: 'yd²', system: 'imperial', toBase: v => v * 0.83612736, fromBase: v => v / 0.83612736 },
      { id: 'ft2', name: 'Square Feet', symbol: 'ft²', system: 'imperial', toBase: v => v * 0.09290304, fromBase: v => v / 0.09290304 },
      { id: 'in2', name: 'Square Inches', symbol: 'in²', system: 'imperial', toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
    ]
  },
  speed: {
    id: 'speed',
    name: 'Speed & Velocity',
    description: 'Travel speed, wind rates, and physics velocities',
    icon: Gauge,
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    presets: [
      { label: '100 km/h → mph', value: '100', from: 'kmh', to: 'mph' },
      { label: '60 mph → km/h', value: '60', from: 'mph', to: 'kmh' },
      { label: '10 m/s → km/h', value: '10', from: 'mps', to: 'kmh' },
      { label: '25 kn → km/h', value: '25', from: 'knot', to: 'kmh' },
    ],
    units: [
      { id: 'mps', name: 'Meters / Second', symbol: 'm/s', system: 'si', toBase: v => v, fromBase: v => v },
      { id: 'kmh', name: 'Kilometers / Hour', symbol: 'km/h', system: 'metric', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { id: 'mph', name: 'Miles / Hour', symbol: 'mph', system: 'imperial', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { id: 'knot', name: 'Knots', symbol: 'kn', system: 'other', toBase: v => v * 0.51444444, fromBase: v => v / 0.51444444 },
      { id: 'fps', name: 'Feet / Second', symbol: 'ft/s', system: 'imperial', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    ]
  },
  pressure: {
    id: 'pressure',
    name: 'Pressure',
    description: 'Atmospheric, pneumatic, hydraulic, and vacuum units',
    icon: Compass,
    defaultFrom: 'bar',
    defaultTo: 'psi',
    presets: [
      { label: '1 bar → psi', value: '1', from: 'bar', to: 'psi' },
      { label: '1 atm → bar', value: '1', from: 'atm', to: 'bar' },
      { label: '100 kPa → bar', value: '100', from: 'kpa', to: 'bar' },
      { label: '760 mmHg → atm', value: '760', from: 'mmhg', to: 'atm' },
    ],
    units: [
      { id: 'pa', name: 'Pascals', symbol: 'Pa', system: 'si', toBase: v => v, fromBase: v => v },
      { id: 'kpa', name: 'Kilopascals', symbol: 'kPa', system: 'metric', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'mpa', name: 'Megapascals', symbol: 'MPa', system: 'metric', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { id: 'bar', name: 'Bar', symbol: 'bar', system: 'metric', toBase: v => v * 1e5, fromBase: v => v / 1e5 },
      { id: 'mbar', name: 'Millibar (hPa)', symbol: 'mbar', system: 'metric', toBase: v => v * 100, fromBase: v => v / 100 },
      { id: 'psi', name: 'Pounds / Sq Inch', symbol: 'psi', system: 'imperial', toBase: v => v * 6894.757293168, fromBase: v => v / 6894.757293168 },
      { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', system: 'other', toBase: v => v * 101325, fromBase: v => v / 101325 },
      { id: 'mmhg', name: 'Torr / mmHg', symbol: 'mmHg', system: 'other', toBase: v => v * 133.322387415, fromBase: v => v / 133.322387415 },
    ]
  },
  digital: {
    id: 'digital',
    name: 'Digital Storage',
    description: 'Data files, network bandwidth, memory, and disk size',
    icon: HardDrive,
    defaultFrom: 'gb',
    defaultTo: 'mb',
    presets: [
      { label: '1 GB → MB', value: '1', from: 'gb', to: 'mb' },
      { label: '1 TB → GB', value: '1', from: 'tb', to: 'gb' },
      { label: '100 MB → KB', value: '100', from: 'mb', to: 'kb' },
      { label: '1 Byte → Bits', value: '1', from: 'b', to: 'bit' },
    ],
    units: [
      { id: 'bit', name: 'Bits', symbol: 'b', system: 'binary', toBase: v => v * 0.125, fromBase: v => v / 0.125 },
      { id: 'b', name: 'Bytes', symbol: 'B', system: 'binary', toBase: v => v, fromBase: v => v },
      { id: 'kb', name: 'Kilobytes', symbol: 'KB', system: 'binary', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { id: 'mb', name: 'Megabytes', symbol: 'MB', system: 'binary', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
      { id: 'gb', name: 'Gigabytes', symbol: 'GB', system: 'binary', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
      { id: 'tb', name: 'Terabytes', symbol: 'TB', system: 'binary', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    ]
  }
};

interface UnitConverterProps {
  initialCategory?: string;
}

export default function UnitConverter({ initialCategory }: UnitConverterProps = {}) {
  const validInitial: CategoryKey = (initialCategory && initialCategory in CATEGORIES)
    ? (initialCategory as CategoryKey)
    : 'length';
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<CategoryKey>(validInitial);
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>(CATEGORIES[validInitial].defaultFrom);
  const [toUnitId, setToUnitId] = useState<string>(CATEGORIES[validInitial].defaultTo);
  const [decimals, setDecimals] = useState<number>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');

  const currentCategory = CATEGORIES[selectedCategoryKey];

  // Safely retrieve the current From and To units, falling back to valid defaults if mismatched
  const fromUnit = useMemo(() => {
    return (
      currentCategory.units.find(u => u.id === fromUnitId) ||
      currentCategory.units.find(u => u.id === currentCategory.defaultFrom) ||
      currentCategory.units[0]
    );
  }, [currentCategory, fromUnitId]);

  const toUnit = useMemo(() => {
    return (
      currentCategory.units.find(u => u.id === toUnitId) ||
      currentCategory.units.find(u => u.id === currentCategory.defaultTo) ||
      currentCategory.units[1] ||
      currentCategory.units[0]
    );
  }, [currentCategory, toUnitId]);

  // Handle switching category: smoothly reassign valid From and To units
  const handleCategorySelect = (newCatKey: CategoryKey) => {
    setSelectedCategoryKey(newCatKey);
    const cat = CATEGORIES[newCatKey];
    setFromUnitId(cat.defaultFrom);
    setToUnitId(cat.defaultTo);
    setTableSearch('');
  };

  // Swap From and To units
  const handleSwapUnits = () => {
    const currentFrom = fromUnit.id;
    const currentTo = toUnit.id;
    setFromUnitId(currentTo);
    setToUnitId(currentFrom);
  };

  // Quick preset loader
  const handleApplyPreset = (preset: { value: string; from: string; to: string }) => {
    setInputValue(preset.value);
    setFromUnitId(preset.from);
    setToUnitId(preset.to);
  };

  // Stepper helper
  const handleStep = (delta: number) => {
    const current = parseFloat(inputValue);
    const valid = isNaN(current) ? 0 : current;
    const nextVal = Math.round((valid + delta) * 1000) / 1000;
    setInputValue(nextVal.toString());
  };

  // Copy helper
  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  // Numerical calculation
  const parsedInput = parseFloat(inputValue);
  const isValidNumber = !isNaN(parsedInput) && isFinite(parsedInput);

  const conversionResult = useMemo(() => {
    if (!isValidNumber) return null;
    try {
      const baseVal = fromUnit.toBase(parsedInput);
      return toUnit.fromBase(baseVal);
    } catch {
      return null;
    }
  }, [isValidNumber, parsedInput, fromUnit, toUnit]);

  // Ratio between 1 fromUnit and toUnit
  const unitRate = useMemo(() => {
    try {
      const base1 = fromUnit.toBase(1);
      return toUnit.fromBase(base1);
    } catch {
      return null;
    }
  }, [fromUnit, toUnit]);

  // Inverse ratio
  const inverseRate = useMemo(() => {
    try {
      const base1 = toUnit.toBase(1);
      return fromUnit.fromBase(base1);
    } catch {
      return null;
    }
  }, [fromUnit, toUnit]);

  // Calculate live equivalents for all units in current category
  const allEquivalents = useMemo(() => {
    if (!isValidNumber) {
      return currentCategory.units.map(unit => ({
        unit,
        value: null
      }));
    }
    const baseVal = fromUnit.toBase(parsedInput);
    return currentCategory.units.map(unit => ({
      unit,
      value: unit.fromBase(baseVal)
    }));
  }, [currentCategory, fromUnit, parsedInput, isValidNumber]);

  // Filter equivalents table by search query
  const filteredEquivalents = useMemo(() => {
    if (!tableSearch.trim()) return allEquivalents;
    const q = tableSearch.toLowerCase().trim();
    return allEquivalents.filter(
      item =>
        item.unit.name.toLowerCase().includes(q) ||
        item.unit.symbol.toLowerCase().includes(q) ||
        item.unit.system.toLowerCase().includes(q)
    );
  }, [allEquivalents, tableSearch]);

  // Mathematical formula string
  const formulaExplanation = useMemo(() => {
    if (selectedCategoryKey === 'temperature') {
      if (fromUnit.id === 'c' && toUnit.id === 'f') {
        return `(${parsedInput || 'C'} °C × 9/5) + 32 = ${conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'} °F`;
      }
      if (fromUnit.id === 'f' && toUnit.id === 'c') {
        return `(${parsedInput || 'F'} °F - 32) × 5/9 = ${conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'} °C`;
      }
      if (fromUnit.id === 'c' && toUnit.id === 'k') {
        return `${parsedInput || 'C'} °C + 273.15 = ${conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'} K`;
      }
      if (fromUnit.id === 'k' && toUnit.id === 'c') {
        return `${parsedInput || 'K'} K - 273.15 = ${conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'} °C`;
      }
      if (fromUnit.id === 'f' && toUnit.id === 'k') {
        return `(${parsedInput || 'F'} °F - 32) × 5/9 + 273.15 = ${conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'} K`;
      }
      if (fromUnit.id === toUnit.id) {
        return `Same units (${fromUnit.symbol})`;
      }
    }

    if (unitRate !== null && !isNaN(unitRate)) {
      return `Multiply the value by ${formatNumber(unitRate, 6)}: (${parsedInput || 1} × ${formatNumber(unitRate, 6)})`;
    }
    return null;
  }, [selectedCategoryKey, fromUnit, toUnit, parsedInput, conversionResult, decimals, unitRate]);

  return (
    <div className="space-y-6">
      {/* Category Selection Carousel / Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Measurement Category
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-full border border-teal-200/60 dark:border-teal-800/40">
              {currentCategory.units.length} units
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {currentCategory.description}
          </span>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const Icon = cat.icon;
            const isSelected = selectedCategoryKey === catKey;

            return (
              <button
                key={catKey}
                onClick={() => handleCategorySelect(catKey)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all text-xs font-medium ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate w-full text-center text-[11px]">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversion Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Input / Output Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* Header & Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-lg">
                  <currentCategory.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                    {currentCategory.name} Converter
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dynamic unit conversion with precision math
                  </p>
                </div>
              </div>

              {/* Decimal Precision Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Decimals:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  {[2, 4, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDecimals(d)}
                      className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                        decimals === d
                          ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Presets for this Category */}
            {currentCategory.presets.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    Common Presets:
                  </span>
                  <button
                    onClick={() => {
                      setInputValue('1');
                      setFromUnitId(currentCategory.defaultFrom);
                      setToUnitId(currentCategory.defaultTo);
                    }}
                    className="text-[10px] text-slate-400 hover:text-teal-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Default
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCategory.presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800/70 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dual Panel (From & To) with Center Swap */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
              {/* FROM (SOURCE) PANEL */}
              <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    From
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                    {fromUnit.symbol}
                  </span>
                </div>

                {/* Input Number */}
                <div>
                  <input
                    type="number"
                    step="any"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-base font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Stepper shortcuts */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStep(-1)}
                      className="px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleStep(1)}
                      className="px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleStep(10)}
                      className="px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                    >
                      +10
                    </button>
                  </div>
                  <button
                    onClick={() => setInputValue('0')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Zero
                  </button>
                </div>

                {/* Dynamic 'From' Unit Dropdown */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Source Unit
                  </label>
                  <select
                    value={fromUnitId}
                    onChange={(e) => setFromUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {currentCategory.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol}) — {u.system}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP BUTTON (CENTER) */}
              <div className="sm:col-span-1 flex justify-center py-1">
                <button
                  onClick={handleSwapUnits}
                  title="Swap 'From' and 'To' Units"
                  className="p-3 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800 transition-all hover:scale-105 active:scale-95 shadow-xs"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* TO (TARGET) PANEL */}
              <div className="sm:col-span-5 bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200/60 dark:border-teal-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wide">
                    To (Result)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded">
                    {toUnit.symbol}
                  </span>
                </div>

                {/* Big Result Output */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-teal-100 dark:border-teal-900/50 min-h-[50px] flex items-center justify-between">
                  <div className="overflow-x-auto pr-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
                      {conversionResult !== null ? formatNumber(conversionResult, decimals) : '—'}
                    </span>
                    <span className="ml-1.5 text-xs font-medium text-teal-600 dark:text-teal-400">
                      {toUnit.symbol}
                    </span>
                  </div>

                  {conversionResult !== null && (
                    <button
                      onClick={() =>
                        handleCopy(`${formatNumber(conversionResult, decimals)} ${toUnit.symbol}`, 'main-result')
                      }
                      className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                      title="Copy Result"
                    >
                      {copiedKey === 'main-result' ? (
                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Unit Ratio Badge */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {unitRate !== null && !isNaN(unitRate) && (
                    <span>
                      1 {fromUnit.symbol} = {formatNumber(unitRate, 6)} {toUnit.symbol}
                    </span>
                  )}
                </div>

                {/* Dynamic 'To' Unit Dropdown */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Target Unit
                  </label>
                  <select
                    value={toUnitId}
                    onChange={(e) => setToUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {currentCategory.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol}) — {u.system}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Formula / Conversion Math Explanation Banner */}
            {formulaExplanation && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Conversion Formula & Logic
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] break-all">
                    {formulaExplanation}
                  </div>
                  {inverseRate !== null && !isNaN(inverseRate) && selectedCategoryKey !== 'temperature' && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Inverse: 1 {toUnit.symbol} = {formatNumber(inverseRate, 6)} {fromUnit.symbol}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Unit Live Equivalents Matrix */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-sm">
                All {currentCategory.name} Equivalents
              </h4>
              <p className="text-[11px] text-slate-400">
                {inputValue || 0} {fromUnit.symbol} in other units
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {filteredEquivalents.length} units
            </span>
          </div>

          {/* Quick Filter Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter units..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Table / List of Equivalent Values */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto pr-1">
            {filteredEquivalents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No units match &quot;{tableSearch}&quot;
              </div>
            ) : (
              filteredEquivalents.map(({ unit, value }) => {
                const isCurrentTo = unit.id === toUnit.id;
                const isCurrentFrom = unit.id === fromUnit.id;

                return (
                  <div
                    key={unit.id}
                    className={`py-2.5 px-2.5 flex items-center justify-between rounded-xl transition-all ${
                      isCurrentTo
                        ? 'bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60'
                        : isCurrentFrom
                        ? 'bg-slate-100/70 dark:bg-slate-800/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div
                      className="cursor-pointer flex-1 pr-2"
                      onClick={() => setToUnitId(unit.id)}
                      title={`Click to set as Target Unit (${unit.name})`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {unit.name}
                        </span>
                        {isCurrentTo && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-teal-600 text-white rounded font-medium">
                            Target
                          </span>
                        )}
                        {isCurrentFrom && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium">
                            Source
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-medium">
                          {unit.symbol}
                        </span>
                        <span className="text-[9px] text-slate-400 capitalize">
                          {unit.system}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {value !== null ? formatNumber(value, decimals) : '—'}
                        </div>
                      </div>

                      {value !== null && (
                        <button
                          onClick={() => handleCopy(`${formatNumber(value, decimals)} ${unit.symbol}`, unit.id)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={`Copy ${formatNumber(value, decimals)} ${unit.symbol}`}
                        >
                          {copiedKey === unit.id ? (
                            <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Click any unit above to set as target
            </span>
            <button
              onClick={() => {
                setFromUnitId(currentCategory.defaultFrom);
                setToUnitId(currentCategory.defaultTo);
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline text-[10px]"
            >
              Reset Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
