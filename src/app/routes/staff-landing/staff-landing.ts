import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { LocalStorageService } from '@core/settings/local-storage.service';
import { SettingsService } from '@core/settings/settings.service';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { UserButton } from '@theme/widgets/user-button';
import { AppVariablesPipe } from '../../core/settings/app-variables.pipe';
import { ModulesService } from '@core/services/modules.service';
import { settings$ } from '@core/settings/settings.store';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'staff-landing',
  imports: [RouterLink, MatIcon, UserButton, ActionButtonsComponent, AppVariablesPipe],
  templateUrl: './staff-landing.html',
  styleUrl: './staff-landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffLanding implements OnInit {
  st = inject(SettingsService);
  storage = inject(LocalStorageService);
  ms = inject(ModulesService);
  private authService = inject(AuthService);

  animation = settings$.value.animations?.landing;

  private allModules = this.ms.modules;
  private userPermissionsSignal = signal<string[]>([]);

  // Computed signal to filter modules by permissions
  modules = computed(() => {
    return this.filterModulesByPermissions(this.allModules, this.userPermissionsSignal());
  });

  ngOnInit(): void {
    // Subscribe to user permission changes
    this.authService.user$.subscribe((user) => {
      const permissions = user?.permissions || [];
      this.userPermissionsSignal.set(permissions);
    });
  }

  private filterModulesByPermissions(modules: any[], userPermissions: string[] = []): any[] {
    return modules.filter((module) => {
      // If no permissions required, show the module
      if (!module.permissions || module.permissions.length === 0) {
        return true;
      }

      // Check if user has at least one required permission
      return module.permissions.some((perm: string) => userPermissions.includes(perm));
    });
  }

  moduleCode(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }
}
