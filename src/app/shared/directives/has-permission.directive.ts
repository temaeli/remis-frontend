import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[hasPermission]',
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set hasPermission(permissions: string[]) {
    this.viewContainer.clear();
    if (HasPermissionDirective.hasPermission(permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  // Static method for programmatic permission checking
  static hasPermission(permissions: string[]): boolean {
    if (!permissions?.length) return true;

    const userPermissions = HasPermissionDirective.readUserPermissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  private static readUserPermissions(): string[] {
    // `auth.service` writes the flat permission list to `perms` via StorageService,
    // which JSON.stringifies once. Older sessions may have a doubly-encoded value.
    const raw = localStorage.getItem('perms');
    if (!raw) return [];
    try {
      let parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }

  static readUserRoles(): string[] {
    const raw = localStorage.getItem('roles');
    if (!raw) return [];
    try {
      let parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
}
