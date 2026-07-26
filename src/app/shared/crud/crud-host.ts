import { NotificationDialog } from '@shared/components/confirm/confirm.interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

/**
 * Narrow seam for what a CRUD button factory needs from its host component.
 * Replaces taking the whole `BaseComponent`. Tests can satisfy this interface
 * with four functions instead of mocking the entire component graph.
 */
export interface CrudHost {
  fetch(fp: FetchParameter): Promise<any>;
  openModal(component: any, params: any, width?: any, maxHeight?: any, dialogProps?: any): any;
  navigate(parentSlug: string, segments?: string | string[]): void;
  confirm(data: NotificationDialog): Promise<boolean>;
  readonly currentUserUsername: string | undefined;
}
