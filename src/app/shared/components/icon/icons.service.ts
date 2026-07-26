import { Injectable } from '@angular/core';
import { MAT_ICONS } from './mat-icons.constants';
import { SVG_ICONS } from './tag-icons.constants';

export interface SvgIcon {
  name: string;
  tag: string;
}

export type IconType = 'SVG' | 'MATERIAL';

export enum IconTypeEnum {
  SVG = 'SVG',
  MATERIAL = 'MATERIAL',
}

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  defaultType: IconType = 'SVG';
  defaultIcon = 'circle_dashed';

  svgIcons = SVG_ICONS;

  materialIcons = Object.keys(MAT_ICONS)
    .map((k: string) => (MAT_ICONS as any)[k])
    .reduce((p, c) => p.concat(c));

  isSVG = (str: string) => this.svgIcons.find((icon: any) => icon.name === str);

  isMaterial = (str: string) => this.materialIcons.find((icon: string) => icon === str);

  isEither = (s: string) =>
    this.materialIcons.concat(this.svgIcons).find((icon: any) => (icon?.name ?? icon) === s);

  getType = (str: string): IconType | undefined =>
    this.isSVG(str) ? 'SVG' : this.isMaterial(str) ? 'MATERIAL' : undefined;

  setType = (ob: any): any =>
    !(ob.iconType = this.getType(ob.icon)) && (ob.icon = this.defaultIcon);

  constructor() {}
}
