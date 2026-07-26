import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { CrudHost } from './crud-host';

/**
 * Adapt a BaseComponent into the narrow CrudHost seam.
 * Pure function — no side effects. Doesn't modify the component.
 */
export function crudHostFromBase(comp: BaseComponent): CrudHost {
  return {
    fetch: (fp) => comp.fs.fetch(fp),
    openModal: (component, params, width, maxHeight, dialogProps) =>
      comp.vs.openModal(component, params, width, maxHeight, dialogProps),
    navigate: (parentSlug, segments) => navigateRelativeTo(comp, parentSlug, segments),
    confirm: async (data) => {
      const ref = comp.notify.confirm({ confirmText: 'Proceed', ...data });
      return !!(await firstValueFrom(ref.afterClosed()));
    },
    get currentUserUsername() {
      return comp.auth.user$.value?.username;
    },
  };
}
