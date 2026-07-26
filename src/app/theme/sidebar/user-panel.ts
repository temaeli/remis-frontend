import { Component, ViewEncapsulation, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'app/routes/auth';
import { AppVariablesPipe } from '../../core/settings/app-variables.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-panel',
  template: `
    @if (user$.value; as user) {
      <a class="app-user-panel mt-1 " routerLink="/user/profile">
        <img
          class="app-user-panel-avatar"
          [src]="user?.avatar ?? ('avatar' | appVariables)"
          alt="avatar"
          width="64"
        />
        <div class="app-user-panel-info">
          <h4>{{ user?.name }}</h4>
          <h5>{{ user?.email }}</h5>
        </div>
      </a>
    }
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    AppVariablesPipe,
    CommonModule,
  ],
})
export class UserPanel {
  readonly auth = inject(AuthService);
  user$ = this.auth.user$;
}
