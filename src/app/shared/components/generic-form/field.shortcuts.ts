import { FieldConfig } from './field.interface';

export type FC = FieldConfig;

export const toggleTableButton = (f: FC) => (f.showToggleTable = !f.showToggleTable);
