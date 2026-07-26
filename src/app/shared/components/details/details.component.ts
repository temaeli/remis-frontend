import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Input, ChangeDetectorRef, SimpleChanges, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ATTACHMENT_KEYS, BASE_KEYS, DEFAULT_FIELD_STRINGS } from './util/field/field.constants';
import { HELPER_KEYS, NAME_KEYS, STATUS_KEYS } from './util/field/field.constants';
import { DetailsParameter, FieldLayout } from './details.interface';
import { getBase64Object } from './util/base-64/base-64.helpers';
import { getFirstPresentKeyValue, setObjectParameters } from './util/util.helpers';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { listenToShortcuts } from './details.shortcuts';
import { nameFromFieldString, sortFieldsByKeys } from './util/field/fields.helper';
import { getGroupsFromMap, getNameField, inParensAfter } from './util/field/fields.helper';
import { getGroupsFromDetailsGroups } from './util/field/fields.helper';
import { flattenFields, getAllFields } from './util/field/fields.helper';
import { Obj } from './util/util.interface';
import { FieldsSort, Field, KeyField, DetailGroup } from './util/field/field.interface';
import { FieldsProperties, FieldsGroupsMap, FieldGroup } from './util/field/field.interface';
import { CommonModule } from '@angular/common';
import { MergeClassesPipe } from './util/class-name/merge-classes.pipe';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { IncludesPipe } from './util/pipes/includes.pipe';
import { LabelPipe } from './util/pipes/label.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SafeHtmlPipe } from './util/pipes/safe-html.pipe';
import { ContrastGrayPipe } from './util/color/contrast-gray.pipe';
import { BgIconMarkComponent } from './bg-icon-mark/bg-icon-mark.component';
import { DetailsHeaderComponent, HeaderParameter } from './details-header/details-header.component';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ViewService } from '@shared/services/view.service';
import { DetailsClass } from './details.class';
import { DataGridComponent } from '../data-grid/data-grid.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ViewAttachmentComponent } from '../view-attachment/view-attachment.component';
import { AttachmentParameter } from '../view-attachment/view-attachment.component';
import { SlidingTabIndicatorDirective } from '@shared/directives/sliding-tab-indicator.directive';
import { ToObservablePipe } from '../../pipes/to-observable.pipe';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { AnyPipe } from '@shared/pipes/any.pipe';
import { valueIncludes } from '@core/helpers';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { BaseAttachment } from '../generic-form/attachment/attachment.interface';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [
    CommonModule,
    MergeClassesPipe,
    ActionButtonsComponent,
    MatTabGroup,
    MatTab,
    IncludesPipe,
    LabelPipe,
    MatDivider,
    MatIcon,
    MatProgressBar,
    SafeHtmlPipe,
    ContrastGrayPipe,
    MatExpansionModule,
    BgIconMarkComponent,
    DetailsHeaderComponent,
    MatDialogContent,
    MatDialogModule,
    MatTabsModule,
    AnyPipe,
    DataGridComponent,
    DragDropModule,
    SlidingTabIndicatorDirective,
    ToObservablePipe,
    TruncatePipe,
  ],
})
export class DetailsComponent extends DetailsClass implements OnInit, OnChanges, OnDestroy {
  subs = new Subscription();
  vs = inject(ViewService);
  cdr = inject(ChangeDetectorRef);

  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<DetailsComponent>, { optional: true });

  @Input() title?: string = undefined;
  @Input() showTitle?: boolean = false;
  @Input() icon?: string = undefined;
  @Input() actionButtons: ActionButton[] = [];

  @Input() headerParameter: HeaderParameter = {
    containerClass: 'mb-3',
    titleClass: 'text-primary',
  };

  @Input() animation = settings$.value.animations?.pages;
  @Input() animationTabs = settings$.value.animations?.tabs;

  @Input() showArraysTotal = true;
  @Input() showFieldsTotal = false;
  @Input() expandLists = false;

  @Input() entity: any = undefined;
  @Input() detailsParameter: Partial<DetailsComponent> = {};

  @Input() fieldsStrings: string[] = [];
  @Input() visibleKeys: string[] = []; // TODO: make visiblekeys able to expand eg ward.region.name

  @Input() keyFields: KeyField[] = [];
  @Input() sortedKeys: string[] = [];
  @Input() hiddenKeys: string[] = [];
  @Input() fieldsProperties: FieldsProperties = {};

  @Input() lastDotAsName = false;
  @Input() fieldsGroupsMap?: FieldsGroupsMap = undefined;
  @Input() detailsGroups?: DetailGroup[] = [];
  @Input() showFirstGroupHeader = true;
  fieldsGroups: FieldGroup[] = [];
  allFields?: Field[];

  @Input() viewInnerObjects = true;
  @Input() hideSensitiveFields = true;
  @Input() hideUndefined = true;
  @Input() showEmptyGroups = false;
  @Input() emptyGroupValue = '--';
  @Input() undefinedValue = '--';
  @Input() showEmptyArrays = false;

  @Input() maxTableColumns = 4;
  @Input() defaultArraysName = 'default';
  @Input() tableViewDetailsClicks = 3;
  @Input() tableArrayThreshold = 100;
  @Input() hideArrays = false;
  @Input() innerArraysClass = '';
  @Input() showAllArraysInTable = false;

  @Input() sortby?: FieldsSort | FieldsSort[] = undefined;

  layouts: FieldLayout[] = ['inline-list', 'list', 'table', 'palletes'];
  layoutIndexCounter = -1;
  overide = false;

  canShowHeader = false;

  dialogButtons: ActionButton[] = [
    {
      // icon: 'cancel',
      label: 'Close',
      iconClass: 'small',
      click: () => this.dialogRef?.close(),
    },
  ];

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    setObjectParameters(this, this.detailsParameter);
    this.setLayout(this.layout);
    this.loadFields();
  }

  async ngOnInit() {
    this.layoutIndexCounter = this.layouts.findIndex((layout) => layout === this.layout);
    if (!this.entity) this.setInputsFromData(this.dialogData); // only if is dialog //
    if (!this.entity) return;

    this.listenToActions();

    setObjectParameters(this, this.detailsParameter);
    this.setLayout(this.layout);
    this.loadFields();
  }

  setInputsFromData(data: any) {
    if (typeof data !== 'object' && !Array.isArray(data)) this.dialogRef?.close();
    if (!data?.entity) data = { entity: data }; // if just data is passed without inner entity
    setObjectParameters(this, data);
  }

  async loadFields() {
    // get the fields;
    this.hiddenKeys = this.hiddenKeys.concat(HELPER_KEYS);

    // get fields
    this.allFields = getAllFields(this.entity, {
      visibleKeys: this.visibleKeys,
      keyFields: this.keyFields,
      sortedKeys: this.sortedKeys,

      fieldGroupsMap: this.fieldsGroupsMap,
      detailsGroups: this.detailsGroups,

      hiddenKeys: this.hiddenKeys,
      fieldsStrings: this.fieldsStrings.concat(DEFAULT_FIELD_STRINGS),
      fieldsProperties: this.fieldsProperties,
      autoPipeValues: this.autoPipeValues,
      hideUndefined: this.hideUndefined,
      undefinedValue: this.undefinedValue,
      sortby: this.sortby,
    });

    this.title = this.title ?? getNameField(this.entity)?.value ?? 'ALL DETAILS';

    this.createFieldGroups(this.allFields);
    this.canShowHeader = (this.showTitle && !!this.title) || !!this.actionButtons.length;
    // if (this.allFields.find((f) => f.key.includes('ermissions'))) console.log(this.allFields);
  }

  createFieldGroups(allFields: Field[]) {
    let groups_: FieldGroup[] = [];

    // make base groups
    if (this.fieldsGroupsMap) groups_ = getGroupsFromMap(this.fieldsGroupsMap);
    else if (this.detailsGroups?.length) groups_ = getGroupsFromDetailsGroups(this.detailsGroups);

    // assign fields to groups
    let groups: FieldGroup[] = [];
    if (groups_.length) groups = this.getAllocatedGroups(allFields, groups_);
    else if (this.showFieldsInGroups) groups = this.getDefaultGroups(allFields);
    else groups = this.getMinimalGroups(allFields);

    //filter out empty groups — a field that is hidden or sensitive doesn't render,
    //so a group whose every field is hidden/sensitive is effectively empty.
    const hasVisibleField = (g: FieldGroup) =>
      g.fields?.some((f) => !f.hidden && !f.sensitive) || g.groups?.length;
    this.fieldsGroups = groups.filter((g) => (this.showEmptyGroups ? true : hasVisibleField(g)));
  }

  getAllocatedGroups(allFields: Field[], mappedGroups: FieldGroup[]) {
    const fieldsGroups: FieldGroup[] = [];
    const fieldsFlat = flattenFields(allFields);

    const processGroup = (group: FieldGroup, allGroupKeys: string[]): FieldGroup | null => {
      // Combine already init field with those in keys
      const fieldK = group?.fields?.map((f) => f.key.split(' ')[0]) ?? [];
      const allPaths = (group.keys?.map((k) => k.split(' ')[0]) ?? []).concat(fieldK);
      let fields: Field[] = [];

      const getFieldsFromKeys = (keys: string[]): Field[] => {
        const fields_ = group?.fields ? flattenFields(group.fields) : [];

        return keys
          .map((k) => {
            const field = fieldsFlat.find((f) => f.path === k || f.key === k || f.path?.endsWith(k));
            const field_ = fields_?.find((f) => f.path === k || f.key === k || f.path?.endsWith(k));
            return { ...field, ...field_ };
          })
          .filter((f) => !!f?.key) as Field[];
      };

      // If a group has ... in keys add rest of the ungrouped fields to it
      if (allPaths.includes('...')) {
        const allFieldsKeys = allFields.filter((x) => !!x.key).map((f) => f.key.split(' ')[0]);
        const notGroupedKeys = allFieldsKeys.filter((k) => !allGroupKeys.includes(k));
        const ownKeys = allPaths.filter((k) => !k.includes('...'));
        fields = getFieldsFromKeys(ownKeys).concat(getFieldsFromKeys(notGroupedKeys)) ?? [];

        //put arrays last in the group
        fields = [...fields].sort(
          (a, b) => (a.type?.includes('Array') as any) - (b.type?.includes('Array') as any),
        );
      } else fields = getFieldsFromKeys(allPaths);

      const label = nameFromFieldString((group.label as any));
      const icon = group.icon ?? inParensAfter((group.label as any), 'icon');

      // Process nested groups recursively
      let nestedGroups: FieldGroup[] | undefined;

      if (group.groups && group.groups.length > 0) {
        nestedGroups = group.groups
          .map((nestedGroup) => processGroup(nestedGroup, allGroupKeys))
          .filter((g): g is FieldGroup => g !== null);
      }

      if (this.sortedKeys.length) fields = sortFieldsByKeys(fields, this.sortedKeys);
      const processedGroup: FieldGroup = { ...group, fields, label, icon, groups: nestedGroups };
      if (fields.find((f) => f.type?.includes('Array'))) processedGroup.hasArray = true;

      // return group as is if groups with no contents are allowed
      if (this.showEmptyGroups) return processedGroup;
      // Return the group if it has fields or nested groups with content

      if (fields.length || (nestedGroups && nestedGroups.length > 0)) return processedGroup;

      return null;
    };

    // Collect all keys from all groups (including nested) for '...' handling
    const collectAllKeys = (groups: FieldGroup[]): string[] => {
      let keys: string[] = [];

      groups.forEach((group) => {
        if (group.keys) keys = keys.concat(group.keys);
        if (group.groups) keys = keys.concat(collectAllKeys(group.groups));
      });
      return keys;
    };

    const allGroupKeys = collectAllKeys(mappedGroups);

    mappedGroups?.forEach((group) => {
      const processedGroup = processGroup(group, allGroupKeys);
      if (processedGroup) fieldsGroups.push(processedGroup);
    });

    return fieldsGroups;
  }

  getMinimalGroups(allFields: Field[]) {
    const nameFields = allFields.filter((f) => !Array.isArray(f.value));
    const groups: FieldGroup[] = [{ label: undefined, fields: nameFields }];

    // separate arrays from other allFields
    const canShowArray = (f: Field) => (this.showEmptyArrays ? true : f?.value?.length);
    const arrays = allFields.filter((f) => Array.isArray(f.value) && canShowArray(f));

    if (arrays?.length) {
      groups.push({
        label: undefined,
        fields: arrays,
        hasArray: true,
        slug: 'arrays',
      });
    }

    return groups;
  }

  getDefaultGroups(allFields: Field[]) {
    const normalFields = allFields.filter((f) => !Array.isArray(f.value));
    let nameFields: Field[] = [];

    const hasKey = (f: Field, s: string) => f.key.includes(s.split(' ')[0]?.trim());

    NAME_KEYS.forEach((s) => normalFields.forEach((f) => hasKey(f, s) && nameFields.push(f)));
    const baseFields = normalFields.filter((x) => BASE_KEYS.includes(x.key.split(' ')[0]?.trim()));

    let fields = normalFields.filter(
      (x) => ![...NAME_KEYS, ...BASE_KEYS].includes(x.key.split(' ')[0]?.trim()),
    );

    const statusFields = normalFields.filter((x) => valueIncludes(x.key, STATUS_KEYS));

    // keep on grouping fields if fewer// dont group if visible fields
    const notEnough = (fields: Field[]) => this.getVisibleCount(fields) < 3;

    // statusFields
    [fields, baseFields].forEach((fields) => {
      if (notEnough(fields)) {
        nameFields = nameFields.concat([...fields]);
        fields = [];
      }
    });

    // if there few name field, combine them with details fields
    if (notEnough(nameFields)) {
      nameFields = nameFields.concat(fields);
      fields = [];
    }

    const canShowArray = (f: Field) => (this.showEmptyArrays ? true : f?.value?.length);
    const arrays = allFields.filter((f) => Array.isArray(f.value) && canShowArray(f));

    const nameG = {
      name: this.showFirstGroupHeader ? 'Details' : undefined,
      icon: this.showFirstGroupHeader ? (this.icon ?? 'document') : undefined,
      fields: nameFields,
      slug: 'name',
    };

    const statusG = { name: 'Status', icon: 'stamp', fields: statusFields, slug: 'status' };
    const fieldsG = { name: 'Details', icon: 'notes', fields, slug: 'fields' };
    const entryG = { name: 'Entry Details', icon: 'lamp', fields: baseFields, slug: 'entry' };
    const arrayG = { name: undefined, fields: arrays, hasArray: true, slug: 'arrays' };

    let groups: FieldGroup[] = [];

    groups =
      this.preset === 'auto-two-groups'
        ? [
            { ...nameG, fields: nameG.fields.concat(statusG.fields, fieldsG.fields) },
            { ...entryG, fields: entryG.fields.concat(arrayG.fields) },
          ]
        : [nameG, statusG, fieldsG, entryG, arrayG];

    return groups;
  }

  getVisibleCount(fields: Field[]): number {
    return fields?.filter((f) => !(f?.hidden || f?.sensitive))?.length;
  }

  hasFieldWithIcon(fields: Field[]) {
    return !!fields?.find((f) => !!f.icon);
  }

  isHiddenField(f: Field) {
    return this.hiddenKeys.includes(f.key);
  }

  viewAttachmentFromObject(o: Obj) {
    return this.viewAttachment({
      key: 'filePath',
      value: getFirstPresentKeyValue(o, ATTACHMENT_KEYS),
    });
  }

  viewAttachment(field: Field) {
    const attachment: BaseAttachment = { extension: field.extension ?? 'pdf' };
    attachment[field?.value?.length > 500 ? 'data' : 'filePath'] = field.value;

    this.vs.openDialog({
      component: ViewAttachmentComponent,
      width: '90%',
      maxWidth: '920px',
      minHeight: '640px',
      maxHeight: '99%',
      data: { attachment, title: field.label } as AttachmentParameter,
    });
  }

  viewDetails(item: Obj) {
    const data: DetailsParameter = {
      entity: item,
      showHeader: true,
      animation: this.animation,
      showFieldsInGroups: this.showFieldsInGroups,
      layout: this.layout,
    };

    this.vs.openModal(DetailsComponent, data, '80%', 'auto');
  }

  getBase64Object(str: string) {
    return getBase64Object(str);
  }

  listenToActions() {
    // listen to keydownevents
    this.subs.add(listenToShortcuts('all-details', this));
  }
}
