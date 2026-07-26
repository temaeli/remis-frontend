import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { Permission, PermissionGroup, Role } from '../role.interface';
import {
  ASSIGN_PERMISSIONS_TO_ROLE,
  LIST_ALL_PERMISSIONS,
} from '../../permissions/permission.graphql';
import { GET_ROLE_BY_UID } from '../role.graphql';

@Component({
  selector: 'app-role-permission-assignment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './role-permission-assignment.html',
})
export class RolePermissionAssignment extends BaseComponent implements OnInit {
  override title = 'Role Permissions';
  override subtitle = 'Assign Permissions to Role';

  roleUid: string | null = this.route.snapshot?.paramMap?.get('uid');

  role = signal<Role | null>(null);
  allPermissionGroups = signal<PermissionGroup[]>([]);
  filteredGroups = signal<PermissionGroup[]>([]);
  selectedPermissionIds = signal<Set<string>>(new Set());
  loading = signal(true);
  formChanged = signal(false);
  searchKey = signal('');
  expanded = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);

    const [role, groups]: [Role, PermissionGroup[]] = await Promise.all([
      this.fs.fetch({ query: GET_ROLE_BY_UID, variables: { roleUid: this.roleUid } }),
      this.fs.fetch({ query: LIST_ALL_PERMISSIONS }),
    ]);

    this.role.set(role);
    this.title = role?.name ?? 'Role Permissions';

    this.allPermissionGroups.set(groups ?? []);
    this.filteredGroups.set(groups ?? []);

    const selectedIds = new Set<string>(
      (role?.permissionList ?? []).map((p: Permission) => p.uid!).filter(Boolean),
    );
    this.selectedPermissionIds.set(selectedIds);

    this.loading.set(false);
    this.cdr.markForCheck();
  }

  hasPermission(uid?: string): boolean {
    return !!uid && this.selectedPermissionIds().has(uid);
  }

  hasAllSelected(group: PermissionGroup): boolean {
    return (
      !!group.permissions?.length &&
      group.permissions.every((p) => this.selectedPermissionIds().has(p.uid!))
    );
  }

  partiallySelected(group: PermissionGroup): boolean {
    const some = group.permissions?.some((p) => this.selectedPermissionIds().has(p.uid!)) ?? false;
    return some && !this.hasAllSelected(group);
  }

  onChange(permission: Permission, checked: boolean): void {
    this.formChanged.set(true);
    this.selectedPermissionIds.update((set) => {
      const next = new Set(set);
      if (checked) next.add(permission.uid!);
      else next.delete(permission.uid!);
      return next;
    });
  }

  toggleGroupPermissions(group: PermissionGroup, checked: boolean): void {
    this.formChanged.set(true);
    this.selectedPermissionIds.update((set) => {
      const next = new Set(set);
      group.permissions?.forEach((p) => {
        if (checked) next.add(p.uid!);
        else next.delete(p.uid!);
      });
      return next;
    });
  }

  filter(key: string): void {
    this.searchKey.set(key);
    if (!key?.trim()) {
      this.filteredGroups.set(this.allPermissionGroups());
      return;
    }
    const s = key.toLowerCase();
    const filtered = this.allPermissionGroups()
      .map((g) => ({
        ...g,
        permissions:
          g.permissions?.filter(
            (p) => p.name?.toLowerCase().includes(s) || p.displayName?.toLowerCase().includes(s),
          ) ?? [],
      }))
      .filter((g) => g.permissions.length > 0 || g.groupName?.toLowerCase().includes(s));
    this.filteredGroups.set(filtered);
  }

  async saveChanges(): Promise<void> {
    const roleDto = {
      permissionUidList: Array.from(this.selectedPermissionIds()),
    };
    await this.fs.fetch({
      notify: true,
      mutation: ASSIGN_PERMISSIONS_TO_ROLE,
      variables: { roleDto, roleUid: this.roleUid },
      successFn: () => {
        this.formChanged.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}
