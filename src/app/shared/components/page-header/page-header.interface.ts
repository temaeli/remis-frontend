import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ToggleButton } from '../toggle-buttons/toggle-buttons.component';

export interface HeaderParameter {
  title?: string;
  subtitle?: string;

  animation?: string;
  nav?: string[];

  buttonHolderClass?: string;
  buttonsContainerClass?: string;

  actionButtons?: ActionButton[];
  toggleButtons?: ToggleButton[];
  value?: any;
  model?: any;
}
