import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { SettingsService } from '@core/settings/settings.service';
import { AppVariablesPipe } from '../../../core/settings/app-variables.pipe';
import { AuthService } from '../auth.service';
import { UserButton } from '@theme/widgets/user-button';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'auth-header',
  standalone: true,
  imports: [CommonModule, ActionButtonsComponent, AppVariablesPipe, UserButton],
  template: `
    <div
      class="min-h-14  stick-top z-100 top-0 left-0 shadow-lg border-b-2 border-secondary p-2
       bg-primary flex justify-between items-center relative overflow-hidden lg:px-8
       {{ animation }} --order-3"
    >
      <div
        class="absolute -left-3 h-[400px] w-[150px] bg-light  "
        style="transform: rotate(45deg);"
      ></div>

      <div class="{{ animation }} --order-3 relative left-5">
        <img class="w-[40px] h-auto" src="{{ 'logo' | appVariables }}" />
      </div>

      <div class="flex items-center gap-2">
        <ng-container *ngIf="auth.check(); else guest">
          <app-user [animation]="animation" />
          <action-buttons
            [actionButtons]="loggedButtons"
            [animation]="animation"
            class="flex flex-wrap gap-2"
          />
        </ng-container>

        <ng-template #guest>
          <action-buttons
            [actionButtons]="headerButtons"
            [animation]="animation"
            class="flex flex-wrap gap-2"
          />
        </ng-template>

        <action-buttons
          [actionButtons]="st.actionButtons"
          [animation]="animation"
          [data]="this"
          class="flex flex-center gap-2 flex-wrap !text-white"
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
      class: 'bg-white !border-secondary  text-secondary  ',
      click: () => this.router.navigate(['/auth/login']),
      showFunction: () => !this.auth.check() && !this.router.url.includes('login'),
    },
    {
      label: 'Register',
      class: 'bg-secondary !border-secondary  text-primary  ',
      click: () => this.router.navigate(['/auth/self-register']),
      showFunction: () => !this.auth.check() && !this.router.url.includes('self-register'),
    },
    {
      label: 'Home',
      class: 'bg-white !border-secondary  text-secondary  ',
      click: () => this.router.navigate(['/']),
      showFunction: () => !this.router.url.includes('home'),
    },

    {
      label: 'Logout',
      class: 'bg-secondary !border-secondary  text-primary  ',
      click: () => this.auth.logout().subscribe(),
      showFunction: () => this.auth.check(),
    },
  ];

  loggedButtons: ActionButton[] = [
    {
      label: 'Modules',
      class: 'bg-white !border-secondary  text-secondary  ',
      click: () => this.router.navigate(['/staff-landing']),
      showFunction: () => this.auth.check(),
    },
  ];
}
