import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { Inquiry } from './inquiry.interface';
import { inquiry$, inquiryFormParameter } from './forms/inquiry.form';
import { GET_INQUIRY_BY_UID } from './inquiry.graphql';

@Component({
  selector: 'app-inquiry-form',
  imports: [PageHeaderComponent, FormComponent],
  template: `
    <div
      class="flex flex-col flex-1 relative mx-auto size-full grow
      {{ animation }} --order-3 backdrop-blur-[3px] z-10
      {{ anonymous ? 'max-w-5xl ' : '' }} "
    >
      <div class="size-full flex flex-col gap-2 {{ anonymous ? ' ' : '' }}">
        @if (!anonymous) {
          <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
        }

        <div class="grow flex flex-col app-form  items-center justify-center ">
          @if (anonymous) {
            <div class=" mb-5 py-2 border-bbb border-gray-400/20 text-center">
              <h2 class="text-2xl font-bold">Lodge a Inquiry</h2>
              <p class="opacity-70">Please fill out the form below to submit your inquiry.</p>
            </div>
          }

          @if (fp) {
            <app-form
              class="block rounded-lg bg-white p-5 xl:px-8 w-full max-w-[680px]"
              [fp]="fp"
            />
          }
        </div>
      </div>
    </div>
  `,
})
export class InquiryForm extends BaseComponent implements OnInit {
  override title = 'Inquiry Management';
  override subtitle = 'Lodge Inquiry';

  fp: FormParameters | undefined;
  inquiry: Inquiry | undefined;
  inquiryUid: string | null = this.route.snapshot.paramMap.get('inquiryUid');

  anonymous: boolean = this.router.url.includes('anonymous');
  backUrl = this.anonymous ? '/' : 'inquiries';

  async ngOnInit() {
    // await this.loadData();
    this.fp = await inquiryFormParameter(this, this.inquiry);
    this.subs.add(inquiry$.subscribe((res) => this.router.navigateByUrl(this.backUrl)));
  }

  async loadData() {
    //
    if (!this.inquiryUid) return;

    // this.inquiry = await this.fs.fetch({
    //   loadingOn: 'app-form',
    //   query: GET_INQUIRY_BY_UID,
    //   variables: { uid: this.inquiryUid },
    //   successFn: (res) => (this.title = res?.data?.title ?? this.title),
    // });
  }
}
