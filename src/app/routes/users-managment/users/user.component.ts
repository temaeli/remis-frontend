import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { userUpsertBtn, user$, userAssignCngStationBtn } from './user.form';
import { GET_USER_BY_UID } from './user.graphql';
import { UserAccount } from './user.interface';
import { CngService } from '@routes/distribution/cng/cng.service';
import { CngStation } from '@routes/distribution/cng/cng-station.interface';

@Component({
  selector: 'app-user',
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="user"
      />
      <!-- Single Page Content -->
      <div class="flex-1 overflow-auto bg-gray-50">
        <div class="max-w-7xl mx-auto p-8">
          <!-- Details Section -->
          <div class="mb-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">User Details</h2>
            <div class="bg-white rounded-lg shadow-sm">
              <div class="grid grid-cols-2 gap-0">
                @for (item of getDetailItems(); track item.key) {
                  <div class="px-6 py-4 border-b border-gray-200 last:border-b-0">
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      {{ item.label }}
                    </div>
                    <div class="text-sm text-gray-900 font-medium">
                      @if (item.value === 'true') {
                        Yes
                      } @else if (item.value === 'false') {
                        No
                      } @else {
                        {{ item.value || '—' }}
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Roles Section -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-8">Assigned Roles</h2>
            @if (user && user.rolesList && user.rolesList.length > 0) {
              @for (userRole of user.rolesList; track $index; let i = $index) {
                @if (userRole.role?.name) {
                  <div class="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    <button
                      (click)="toggleRoleExpanded(i)"
                      class="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      type="button"
                    >
                      <h3 class="text-base font-semibold text-gray-900">
                        {{ i + 1 }}. {{ formatText(userRole.role!.name) }}
                      </h3>
                      <div class="flex items-center gap-2 text-gray-500">
                        <span class="text-xs font-semibold uppercase tracking-widest"
                          >Permissions</span
                        >
                        <span
                          class="text-lg leading-none transition-transform"
                          [class.rotate-180]="isRoleExpanded(i)"
                        >
                          ⬆
                        </span>
                      </div>
                    </button>
                    @if (
                      isRoleExpanded(i) &&
                      userRole.role &&
                      userRole.role.permissionList &&
                      userRole.role.permissionList.length > 0
                    ) {
                      <div class="p-6 animate-in fade-in duration-200">
                        <div class="grid grid-cols-3 gap-6">
                          @for (permission of userRole.role.permissionList; track permission.id) {
                            <div class="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked
                                disabled
                                class="w-5 h-5 cursor-default mt-0.5 flex-shrink-0 accent-green-700 rounded"
                                style="accent-color: #1f7e4a;"
                              />
                              <span class="text-sm text-gray-700">{{
                                formatText(permission.name)
                              }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            }
          </div>

          <!-- Plants Section -->
          <div class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">Assigned Plants</h2>
            @if (user && user.plants && user.plants.length > 0) {
              <div class="grid gap-4">
                @for (userPlant of user.plants; track userPlant.id) {
                  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div>
                          <h3 class="text-base font-semibold text-gray-900">
                            {{ userPlant.plant.code }}
                          </h3>
                          <p class="text-xs text-gray-500 mt-1">{{ userPlant.plant.name }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        @if (userPlant.current) {
                          <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
                          >
                            <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            Current
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                No plants assigned
              </div>
            }
          </div>

          <!-- CNG Stations Section -->
          <div class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">Assigned CNG Stations</h2>
            @if (cngStation) {
              <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span class="text-lg">📍</span>
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900">
                        {{ cngStation.code }}
                      </h3>
                      <p class="text-xs text-gray-500 mt-1">{{ cngStation.name }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">{{ cngStation.stationType }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                    >
                      <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Assigned
                    </span>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 text-xs">Region</p>
                    <p class="text-gray-900 font-medium">{{ cngStation.region || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-xs">Location</p>
                    <p class="text-gray-900 font-medium">{{ cngStation.location || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-xs">Contact</p>
                    <p class="text-gray-900 font-medium">{{ cngStation.contact || '—' }}</p>
                  </div>
                </div>
              </div>
            } @else {
              <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                No CNG stations assigned
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserComponent extends BaseComponent implements OnInit {
  override title = 'User';
  override subtitle = 'User Management';

  user: UserAccount | undefined;
  cngStation: CngStation | undefined;
  override actionButtons: ActionButton[] = [userUpsertBtn(this), userAssignCngStationBtn(this)];
  expandedRoles = signal<Set<number>>(new Set());

  private userUid = this.route.snapshot?.paramMap?.get('uid');
  private cngService = inject(CngService);

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_USER_BY_UID,
    successFn: (res) =>
      (this.title =
        `${(res as UserAccount)?.firstName ?? ''} ${(res as UserAccount)?.lastName ?? ''}`.trim() ||
        'User'),
    variables: { uid: this.userUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(user$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.user = await this.fs.fetch(this.fetchParameter);

    // Fetch CNG station assigned to this user
    if (this.userUid) {
      try {
        this.cngStation = await this.cngService.cngStationForUser(this.userUid).toPromise();
      } catch (error) {
        console.error('Error fetching CNG station:', error);
        this.cngStation = undefined;
      }
    }

    // Expand all roles by default
    if (this.user?.rolesList && this.user.rolesList.length > 0) {
      const allIndices = new Set(Array.from({ length: this.user.rolesList.length }, (_, i) => i));
      this.expandedRoles.set(allIndices);
    }
    console.log(this.user);
    this.cdr.detectChanges();
  }

  private formatRolesData() {
    if (!this.user?.rolesList || this.user.rolesList.length === 0) {
      return {};
    }

    const rolesObject: Record<string, string[]> = {};

    this.user.rolesList
      .filter((ur) => ur.role?.name)
      .forEach((ur) => {
        const roleName = ur.role?.name?.replace(/_/g, ' ') || 'Unknown Role';
        const permissions =
          ur.role?.permissionList
            ?.map((p) => p.name?.replace(/_/g, ' '))
            .filter((name): name is string => !!name) || [];
        rolesObject[roleName] = permissions;
      });

    return rolesObject;
  }

  getDetailItems() {
    if (!this.user) return [];

    const hiddenKeys = [
      'password',
      'updatedAt',
      'deletedAt',
      'createdAt',
      'rolesList',
      'plants',
      'uid',
      'authorities',
      'id',
      '__typename',
    ];
    const items: { key: string; label: string; value: string }[] = [];

    for (const [key, value] of Object.entries(this.user)) {
      if (hiddenKeys.includes(key) || !value) continue;

      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

      items.push({
        key,
        label: displayLabel,
        value: String(value),
      });
    }

    return items;
  }

  formatText(value: string | undefined): string {
    if (!value) return '';
    return value.replaceAll('_', ' ');
  }

  toggleRoleExpanded(index: number): void {
    const current = this.expandedRoles();
    const newSet = new Set(current);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    this.expandedRoles.set(newSet);
  }

  isRoleExpanded(index: number): boolean {
    return this.expandedRoles().has(index);
  }
}
