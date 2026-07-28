import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { GetArrayPipe } from '../../pipes/get-array.pipe';

@Component({
  selector: 'depth-bg',
  template: ` <div
      class="size-full top-0 left-0 absolute z-0"
      style="
        background-image:
          linear-gradient(var(--color-primary-faded) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-primary-faded) 1px, transparent 1px),
          linear-gradient(var(--color-primary-very-faded) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-primary-very-faded) 1px, transparent 1px);
        background-size:
          160px 160px,
          160px 160px,
          32px 32px,
          32px 32px;
        opacity: 0.5;
      "
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
