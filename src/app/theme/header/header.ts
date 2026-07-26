import { Component, Input, ViewEncapsulation, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import screenfull from 'screenfull';

import { Branding } from '../widgets/branding';
import { NotificationButton } from '../widgets/notification-button';
import { TranslateButton } from '../widgets/translate-button';
import { UserButton } from '../widgets/user-button';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { SettingsService } from '@core/settings/settings.service';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { class: 'app-header' },
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    Branding,
    UserButton,
    ActionButtonsComponent,
  ],
})
export class Header {
  st = inject(SettingsService);

  @Input() animation = settings$.value.animations?.button;
  readonly showToggle = input(true);
  readonly showBranding = input(false);

  readonly toggleSidenav = output<void>();
  readonly toggleSidenavNotice = output<void>();

  toggleFullscreen() {
    if (screenfull.isEnabled) screenfull.toggle();
  }
}
