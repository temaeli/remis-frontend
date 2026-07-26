import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_FORM, GET_SECURITY_FORM_FIELDS } from './security-form.graphql';
import { securityFormUpsertBtn, securityFormDeleteBtn, securityForm$ } from './security-form.form';

@Component({
  selector: 'security-form-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="securityForm"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityFormDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Form';
  override subtitle = 'Security Form Details';

  securityForm: any;
  formFields: any[] = [];
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityFormUpsertBtn(this),
    securityFormDeleteBtn(this),
  ];

  securityFormUid = this.route.snapshot?.paramMap?.get('securityFormUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_FORM,
    successFn: (res) => (this.title = res?.data?.name ?? this.title),
    variables: { uid: this.securityFormUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityForm$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.securityForm = await this.fs.fetch(this.fetchParameter);
    const viewSecurityForm = formatEntityDates(this.securityForm);

    // Fetch form field definitions
    if (this.securityFormUid) {
      try {
        const fieldsRes = await this.fs.fetch({
          query: GET_SECURITY_FORM_FIELDS,
          variables: { formUid: this.securityFormUid },
          loadingOn: 'no-content',
        });
        // Try different response structures
        this.formFields = fieldsRes?.securityFormFields ?? fieldsRes?.data ?? fieldsRes ?? [];
      } catch (error) {
        console.warn('Failed to fetch form fields:', error);
        this.formFields = [];
      }
    }

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewSecurityForm,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'FormFields',
        label: 'Form Fields',
        icon: 'assignment',
        theme: 'simple',
        keyColumns: ['fieldKey', 'label', 'fieldType', 'required', 'orderIndex'],
        gridData: this.formFields,
      },
    ];

    this.cdr.detectChanges();
  }
}
