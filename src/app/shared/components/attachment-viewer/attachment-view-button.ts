import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

/**
 * Row action that opens an attachment in the shared viewer page
 * (`hse/attachments/:attachmentUid` → Details + Content tabs). Navigates
 * absolutely so it works from any module's detail page, since the viewer route
 * is a sibling under `hse`, not a child of the calling route.
 */
export function attachmentViewBtn(
  comp: BaseComponent,
  permissions: string[] = [],
): ActionButton {
  return {
    icon: 'visibility',
    label: 'View',
    color: 'primary',
    toolTip: 'View Attachment',
    permissions,
    click: (row: any) => {
      if (!row?.uid) return;
      comp.router.navigate(['/hse/attachments', row.uid]);
    },
  };
}
