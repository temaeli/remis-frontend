import { Option } from '@shared/components/generic-form/field.interface';

/**
 * Mirror of the backend `UnitOfMeasure` enum, shared by the HSE masters that
 * carry a unit of measure (Energy Use, Emission Substance).
 *
 * The form `value` MUST be the exact backend enum NAME (it is sent straight to
 * the GraphQL `UnitOfMeasure` enum) — note the intentional triple-R typo in
 * `KILOGRRAM_PER_CUBIC_METER`, kept to match the backend. The `label` is the
 * human-readable symbol the backend pairs with each value.
 */
export enum UnitOfMeasure {
  Mole = 'Mole',
  MEGA_JOULES_PER_CUBIC_METER = 'MEGA_JOULES_PER_CUBIC_METER',
  KILOGRRAM_PER_CUBIC_METER = 'KILOGRRAM_PER_CUBIC_METER',
  NORMAL_CUBIC_METERS_PER_DAY = 'NORMAL_CUBIC_METERS_PER_DAY',
  MEGAWATT_HOUR = 'MEGAWATT_HOUR',
  CUBIC_FEET = 'CUBIC_FEET',
  LITERS = 'LITERS',
  KILOWATT_HOUR = 'KILOWATT_HOUR',
  KILOGRAM = 'KILOGRAM',
}

/** Backend display symbol for each unit of measure. */
export const UNIT_OF_MEASURE_SYMBOLS: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.Mole]: 'Mole%',
  [UnitOfMeasure.MEGA_JOULES_PER_CUBIC_METER]: 'MJ/m³',
  [UnitOfMeasure.KILOGRRAM_PER_CUBIC_METER]: 'Kg/m³',
  [UnitOfMeasure.NORMAL_CUBIC_METERS_PER_DAY]: 'Nm³/day',
  [UnitOfMeasure.MEGAWATT_HOUR]: 'MWh',
  [UnitOfMeasure.CUBIC_FEET]: 'ft³',
  [UnitOfMeasure.LITERS]: 'L',
  [UnitOfMeasure.KILOWATT_HOUR]: 'kWh',
  [UnitOfMeasure.KILOGRAM]: 'kg',
};

/** Select options: value = enum name, label = display symbol. */
export const UNIT_OF_MEASURE_OPTIONS: Option[] = Object.values(UnitOfMeasure).map((value) => ({
  value,
  label: UNIT_OF_MEASURE_SYMBOLS[value],
}));

/** Resolve a unit's display symbol, falling back to the raw value. */
export const unitSymbol = (value?: string): string =>
  (value && UNIT_OF_MEASURE_SYMBOLS[value as UnitOfMeasure]) || value || '';
