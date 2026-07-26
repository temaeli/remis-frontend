// Static Unit of Measure options for gate pass items.
// `unitOfMeasure` is a free-text string column on the backend (no schema enum
// backs it), so this list is presentational only — any string still saves fine.

import { Option } from '@core/helpers';

export const SECURITY_UNIT_OF_MEASURE_OPTIONS: Option[] = [
  // Gas volume
  { label: 'Cubic Meter (m³)', value: 'M3' },
  { label: 'Standard Cubic Meter (Sm³/Nm³)', value: 'SM3' },
  { label: 'Standard Cubic Feet (SCF)', value: 'SCF' },
  { label: 'Thousand Standard Cubic Feet (MSCF)', value: 'MSCF' },
  { label: 'Million Standard Cubic Feet (MMSCF)', value: 'MMSCF' },
  { label: 'Million British Thermal Units (MMBtu)', value: 'MMBTU' },
  { label: 'Therm', value: 'THERM' },

  // LPG / bulk liquid
  { label: 'Kilogram (kg)', value: 'KG' },
  { label: 'Metric Tonne (MT)', value: 'MT' },
  { label: 'Liter (L)', value: 'L' },
  { label: 'Barrel (bbl)', value: 'BBL' },

  // Cylinders / packaged products
  { label: 'Cylinder (CYL)', value: 'CYL' },
  { label: 'Piece (PCS)', value: 'PCS' },
  { label: 'Unit', value: 'UNIT' },
  { label: '6 kg Cylinder', value: 'CYL_6KG' },
  { label: '15 kg Cylinder', value: 'CYL_15KG' },
  { label: '38 kg Cylinder', value: 'CYL_38KG' },
  { label: '45 kg Cylinder', value: 'CYL_45KG' },

  // Flow rate
  { label: 'Cubic Meter per Hour (m³/hr)', value: 'M3_HR' },
  { label: 'Standard Cubic Meter per Day (Sm³/day)', value: 'SM3_DAY' },
  { label: 'Million Standard Cubic Feet per Day (MMSCFD)', value: 'MMSCFD' },
  { label: 'Kilogram per Hour (kg/hr)', value: 'KG_HR' },

  // Pressure
  { label: 'Bar', value: 'BAR' },
  { label: 'PSI', value: 'PSI' },
  { label: 'Kilopascal (kPa)', value: 'KPA' },
  { label: 'Millibar (mbar)', value: 'MBAR' },

  // Energy / heating value
  { label: 'Megajoule (MJ)', value: 'MJ' },
  { label: 'Gigajoule (GJ)', value: 'GJ' },
  { label: 'Kilowatt Hour (kWh)', value: 'KWH' },
  { label: 'BTU per SCF (Btu/SCF)', value: 'BTU_SCF' },
  { label: 'Kilocalorie per Cubic Meter (kcal/m³)', value: 'KCAL_M3' },

  // Equipment / spares & services
  { label: 'Each (EA)', value: 'EACH' },
  { label: 'Set', value: 'SET' },
  { label: 'Pair', value: 'PAIR' },
  { label: 'Meter (m)', value: 'METER' },
  { label: 'Roll', value: 'ROLL' },
  { label: 'Drum', value: 'DRUM' },
  { label: 'Pack', value: 'PACK' },
  { label: 'Man-hour', value: 'MAN_HOUR' },
  { label: 'Lot', value: 'LOT' },
];
