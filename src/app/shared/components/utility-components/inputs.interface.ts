import { OptionsVariable } from '../generic-form/field.interface';
import { InputType } from '../generic-form/form.helpers';

export interface DataInput {
  labelToolTip?: string;
  label?: string;
  type?: InputType;
  icon?: string;
  options?: any[];
  value?: any;
  order?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  subLabel?: string;
  toolTip?: string;
  hasClear?: boolean;
  multiple?: boolean;
  optionsVariables?: OptionsVariable;

  showOptionIndex?: boolean;
  fieldClass?: string;
  containerClass?: string;
  innerClass?: string;

  digitSize?: string;
  useDigitCouter?: boolean;

  minWidth?: string;
  maxWidth?: string;
  showLabel?: boolean;

  dateRangeProps?: DateRangeProps;
  key?: string;

  onClear?: (data?: any) => any;
  onLabelClick?: (data?: any) => any;
  onChange?: (data?: any) => any;
}

export interface DateRangeProps {
  fromLabel?: string;
  toLabel?: string;
  fromKey?: string;
  toKey?: string;
}
