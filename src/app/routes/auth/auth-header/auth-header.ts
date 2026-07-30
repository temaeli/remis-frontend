import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { SettingsService } from '@core/settings/settings.service';
import { AppVariablesPipe } from '../../../core/settings/app-variables.pipe';
import { AuthService } from '../auth.service';
import { UserButton } from '@theme/widgets/user-button';
import { settings$ } from '@core/settings/settings.store';

const GHOST_BTN = 'border border-primary text-primary bg-transparent hover:bg-primary/10';
const GOLD_BTN = 'bg-secondary !border-secondary text-primary hover:opacity-90';

@Component({
  selector: 'auth-header',
  imports: [ActionButtonsComponent, AppVariablesPipe, UserButton],
  template: `
    <div
      class="min-h-16 stick-top z-100 top-0 left-0 border-b border-line bg-paper flex
       justify-between items-center relative px-4 lg:px-8 {{ animation }} --order-3"
    >
      <div class="relative z-10 flex items-center gap-3 min-w-0">
        <svg class="w-8 h-8 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="32" height="32" rx="2" stroke="var(--color-primary)" stroke-width="1.5" />
          <path d="M20 4v32M4 20h32" stroke="var(--color-primary)" stroke-width="1" opacity="0.3" />
          <path d="M12 26V16l8-5 8 5v10" stroke="var(--color-accent-green)" stroke-width="1.6" />
          <circle cx="20" cy="20" r="2.4" fill="var(--color-secondary)" />
        </svg>
        <span
          class="hidden sm:inline font-semibold tracking-tight text-ink truncate"
          style="font-family: Fraunces, serif"
        >
          {{ 'fullName' | appVariables }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        @if (auth.check()) {
          <app-user [animation]="animation" />
          <action-buttons
            [actionButtons]="loggedButtons"
            [animation]="animation"
            class="flex flex-wrap gap-2"
          />
        } @else {
          <action-buttons
            [actionButtons]="headerButtons"
            [animation]="animation"
            class="flex flex-wrap gap-2"
          />
        }

        <action-buttons
          [actionButtons]="st.actionButtons"
          [animation]="animation"
          [data]="this"
          class="flex flex-center gap-2 flex-wrap !text-ink"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthHeader {
  router = inject(Router);
  st = inject(SettingsService);
  auth = inject(AuthService);

  animation = settings$.value.animations?.auth;
  user$ = this.auth.user$;

  headerButtons: ActionButton[] = [
    {
      label: 'Login',
      class: GHOST_BTN,
      click: () => this.router.navigate(['/auth/login']),
      showFunction: () => !this.auth.check() && !this.router.url.includes('login'),
    },
    {
      label: 'Register',
      class: GOLD_BTN,
      click: () => this.router.navigate(['/auth/self-register']),
      showFunction: () => !this.auth.check() && !this.router.url.includes('self-register'),
    },
    {
      label: 'Home',
      class: GHOST_BTN,
      click: () => this.router.navigate(['/']),
      showFunction: () => !this.router.url.includes('home'),
    },

    {
      label: 'Logout',
      class: GOLD_BTN,
      click: () => this.auth.logout().subscribe(),
      showFunction: () => this.auth.check(),
    },
  ];

  loggedButtons: ActionButton[] = [
    {
      label: 'Modules',
      class: GHOST_BTN,
      click: () => this.router.navigate(['/staff-landing']),
      showFunction: () => this.auth.check(),
    },
  ];
}
