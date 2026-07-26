import { Component, Directive, Input } from '@angular/core';
import { mergeClasses, preserveClass } from './util/class-name/class-name.helpers';
import { FieldLayout } from './details.interface';
import { GridTheme } from '../data-grid/data-grid.interfaces';

@Component({
  selector: 'detail-class',
  template: '',
})
export class DetailsClass {
  @Input() showGroupHeaders = true;
  @Input() showArraysHeaders = true;
  @Input() showUnderlines = true;
  @Input() showColon = false;

  @Input() layout?: FieldLayout = undefined;
  @Input() labelsClass = 'text-xs uppercase tracking-wide label';
  @Input() arraysLabelClass = 'faded';
  @Input() arraysHeaderClass = 'text-bold text-black rounded-lg text-uppercase faded mt-3';
  @Input() valuesClass = 'text-sm font-semibold value';
  @Input() imagesClass = 'max-width-250';

  @Input() groupsClass = '';
  @Input() headerClass = '';
  @Input() fieldsContainerClass = '';
  @Input() groupsContainerClass = '';
  @Input() collectionsContainerClass = '';
  @Input() fieldsClass = 'pb-2';
  @Input() fieldsInnerClass = 'flex flex-col content-between';
  @Input() fieldsOuterClass = 'h-full flex items-center';

  @Input() arraysFieldsClass = 'p-0 col-span-full';
  @Input() groupLabelsClass = '';
  @Input() arraysFieldsLayout?: FieldLayout = undefined;

  @Input() innerClass = ''; //for the shadows
  @Input() iconsClass = 'text-muted';
  @Input() dividerClass = '';
  @Input() groupsHeadersClass = '';
  @Input() totalLabelsClass = '';
  @Input() tabGroupClass = '';

  @Input()
  stringArrayIndexClass =
    `size-[30px] rounded-full border-2 border-gray-300/10 flex items-center justify-center`;

  @Input() preset: 'auto-two-groups' | undefined = undefined;
  @Input() autoPipeValues = false;
  @Input() showFieldsInGroups = false;
  @Input() showGroupsInTabs = false;
  @Input() showBgIconMark = true;

  @Input() theme: GridTheme = 'simple';

  setLayout(layout?: FieldLayout) {
    // if (!layout) return;
    // if (this.fieldsClass?.includes('no-underline')) this.showUnderlines = false;
    // if (this.preset == 'auto-two-groups') this.setAutoGroups();
    // if (layout === 'table') this.setTableLayout();
    // else if (layout === 'palletes') this.setPalletesLayout();
    // else if (layout === 'list') this.setListLayout();
    // else if (layout === 'inline-list') this.setInlineListLayout();
  }

  setTheme(theme: GridTheme) {
    if (theme == 'simple') this.setSimpleTheme();
  }

  setSimpleTheme() {
    //
  }

  setAutoGroups() {
    this.autoPipeValues = true;
    this.showFieldsInGroups = true;
    this.groupsContainerClass = 'd-xl-flex gap-2 h-full';
    this.groupsClass = `block h-full rounded-lg p-3 px-lg-4 mb-2 h-full bg-xl-gradient-white-transparent`;
    this.groupLabelsClass = `flex items-center mb-3 border-left-primary bg-light rounded-r-lg px-2 p-1 `;
    this.fieldsClass = 'py-2';
    this.labelsClass = 'faded pb-2';
    this.fieldsInnerClass = 'py-1';
    this.innerClass = 'h-full';
    this.showBgIconMark = true;
  }

  setTableLayout() {
    this.showUnderlines = false;
    this.showColon = false;

    this.groupsClass = mergeClasses(
      this.groupsClass,
      'mt-2 rounded-slight border border-gray-200 border-color-neutral overflow-hidden',
    );

    this.groupLabelsClass = mergeClasses(this.groupLabelsClass, '');
    this.fieldsClass = mergeClasses('p-0  m-0', this.fieldsClass, true);

    this.fieldsInnerClass = mergeClasses(
      this.fieldsInnerClass,
      'row mx-0 px-0 border border-gray-200 border-top-0 align-items-center h-full',
    );

    this.labelsClass = mergeClasses(
      this.labelsClass,
      'label-value px-2 bg-light-faded h-full col-5 m-0 d-flex align-items-center',
    );

    this.valuesClass = mergeClasses(
      this.valuesClass,
      'label-title px-2 h-full col-7 m-0 d-flex align-items-center',
    );
  }

  setPalletesLayout() {
    this.showUnderlines = false;
    this.showColon = false;

    this.groupsClass = mergeClasses(this.groupsClass, 'bg-light border-none rounded-0 mt-0');

    this.groupLabelsClass = mergeClasses(this.groupLabelsClass, ' ');

    this.fieldsClass = mergeClasses(this.fieldsClass, 'col-12 p-0 max-height-content');

    this.fieldsInnerClass = mergeClasses(
      this.fieldsInnerClass,
      'row mx-0 px-0 roundeddd   bg-white border-0  align-items-center h-full ',
    );

    this.labelsClass = mergeClasses(
      this.labelsClass,
      ' bg-gradient-faded label-value px-2 h-full col-5 m-0 d-flex align-items-center',
    );

    this.valuesClass = mergeClasses(
      this.valuesClass,
      ' label-title px-2 h-full col-7 m-0 d-flex align-items-center',
    );
  }

  setListLayout() {
    this.showUnderlines = true;
    this.showColon = false;
    this.groupsClass = 'pb-4';
    this.groupLabelsClass = mergeClasses(this.groupLabelsClass, ' ');
    this.fieldsClass = `${preserveClass(this.fieldsClass, 'col-')} ps-0 pe-4 py-0 mb-3`;
    this.fieldsInnerClass = 'd-flex flex-column justify-content-between';
    this.labelsClass = 'label-title';
    this.valuesClass = 'label-value';
  }

  setInlineListLayout() {
    this.showUnderlines = false;
    this.showColon = true;
    this.groupsClass = 'pb-4';
    this.groupLabelsClass = mergeClasses(this.groupLabelsClass, ' ');
    this.fieldsClass = `${preserveClass(this.fieldsClass, 'col-')} ps-0 pe-4 py-1`;
    this.fieldsInnerClass = 'd-flex align-items-start';
    this.labelsClass =
      'label-title p-2 rounded-slight bg-light width-150 d-inline-flex justify-content-between';
    this.valuesClass = 'label-value p-2';
  }
}
