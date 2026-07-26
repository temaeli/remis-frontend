import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'app/routes/auth';
import { FetchService } from '@shared/fetch/fetch.service';
import { MY_PROFILE } from '@routes/users-managment/users/user.graphql';
import { User } from '@routes/auth/auth.interface';
import { ReplacePipe } from '../../../shared/pipes/replace.pipe';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    ReplacePipe,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComp implements OnInit {
  private auth = inject(AuthService);
  private fs = inject(FetchService);
  readonly user = toSignal(this.auth.user$);

  readonly fullName = computed(() => {
    const u = this.user();
    return (
      [u?.firstName, u?.middleName, u?.lastName].filter(Boolean).join(' ') ||
      u?.name ||
      u?.username ||
      '—'
    );
  });

  readonly initials = computed(() => {
    const u = this.user();
    const first = u?.firstName?.[0] ?? u?.name?.[0] ?? '';
    const last = u?.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  });

  roleList = signal<string[]>([]);

  readonly roles = computed(() => {
    const u = this.user();

    const fromAuthorities =
      (u?.authorities as { authority: string }[] | undefined)
        ?.map((a) => a.authority)
        .filter(Boolean) ?? [];
    const fromRoles = (u?.roles as string[] | undefined) ?? [];

    console.log({ fromAuthorities, fromRoles });
    return [...new Set([...fromAuthorities, ...fromRoles])];
  });

  readonly showAllRoles = signal(false);

  readonly visibleRoles = computed(() =>
    this.showAllRoles() ? this.roles() : this.roles().slice(0, 10),
  );

  async ngOnInit(): Promise<void> {
    const user: User = await this.fs.fetch({
      query: MY_PROFILE,
    });

    this.roleList.set(user?.rolesList?.map((r: any) => r.role.name) ?? []);
  }
}
