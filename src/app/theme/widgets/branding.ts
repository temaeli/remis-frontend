import { Component, input } from '@angular/core';
import { AppVariablesPipe } from '@core/settings/app-variables.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-branding',
  imports: [AppVariablesPipe, RouterLink],
  template: `
    <a class="branding gap-3" [routerLink]="['', 'staff-landing']">
      <img src="{{ 'icon' | appVariables }}" class="branding-logo" alt="logo" />
      @if (showName()) {
        <span class="branding-name font-bold">{{ 'name' | appVariables }}</span>
      }
    </a>
  `,
  styles: `
    .branding {
      display: flex;
      align-items: center;
      margin: 0 0.5rem;
      text-decoration: none;
      white-space: nowrap;
      color: inherit;
      border-radius: 50rem;
    }

    .branding-logo {
      width: 2rem;
      height: 2rem;
      // border-radius: 50rem;
    }

    .branding-name {
      margin: 0 0.5rem;
      font-size: 1rem;
    }
  `,
})
export class Branding {
  readonly showName = input(true);
}
