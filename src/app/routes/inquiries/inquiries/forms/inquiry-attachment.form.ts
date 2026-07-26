import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { DetailsComponent } from '@shared/components/details/details.component';

export function inquiryReplyAttachmentsBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'attachment_paper',
    toolTip: 'View Attachments',

    click: async (reply: any) => {
      const attachments = await comp.fs.fetch({
        query: LIST_ATTACHMENTS_BY_SOURCE_ID,
        variables: { sourceUid: reply?.uid },
      });

      comp.vs?.openModal(
        DetailsComponent,
        {
          type: 'details',
          showUndefined: true,
          arraysLabelClass: 'none ',
          entity: { attachments: attachments ?? [] },
        },

        '60%',
      );
    },
  };
}
