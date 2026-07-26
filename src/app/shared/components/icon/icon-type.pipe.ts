import { Pipe, PipeTransform, inject } from '@angular/core';
import { IconsService, IconType } from './icons.service';

@Pipe({ name: 'iconType' })
export class IconTypePipe implements PipeTransform {
  iconsService = inject(IconsService);

  transform(icon: string): IconType | undefined {
    return this.iconsService.getType(icon);
  }
}
