import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { GetArrayPipe } from '../../pipes/get-array.pipe';

@Component({
  selector: 'depth-bg',
  template: ` <div
      class="size-full top-0 left-0 absolute z-0 opacity-100  dark:opacity-0  "
      style="background: url('images/light.jpg') right/cover"
    ></div>

    <div
      class="size-full top-0 left-0 absolute z-0  opacity-0 dark:opacity-100 "
      style="background: url('images/dark.jpg') right/cover"
    ></div>

    <div
      class="size-full top-0 left-0 absolute z-1 "
      style="background: radial-gradient(circle, var(--color-white-faded), var(--color-white))"
    ></div>

    <div class="boxes-bg size-full top-0 left-0 absolute animate">
      <div class="boxes-container">
        @for (item of 10 | getArray; track $index; let i = $index) {
          <div></div>
        }
      </div>
    </div>`,
  imports: [GetArrayPipe],
})
export class DepthBg {}
