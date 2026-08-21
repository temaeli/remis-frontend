import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { gql } from '@apollo/client/core';
import mermaid from 'mermaid';

import { FetchService } from '@shared/fetch/fetch.service';

/**
 * A route drawn as a graph — the steps of one workflow and the edges between
 * them.
 *
 * <h3>Where the picture comes from</h3>
 *
 * The two tables that already hold the route: `workflow_steps` for the nodes,
 * `workflow_steps_workflow_steps_connections` for the arrows. So the diagram is
 * the configuration rather than a drawing of it — redraw a route on the
 * connections screen and this follows on the next open, with no second copy to
 * keep in step.
 *
 * That is the one deliberate difference from the same feature in the GASCO
 * frontend, which this borrows its shape from. There a workflow is a hand-written
 * JSON literal in a service and the diagram is built by walking that array in
 * order — which cannot show a branch, because an array has none, and goes stale
 * the moment the real process changes. Here the graph is data, so the picture can
 * show what an array cannot: a step leading to two others, a step nothing leads
 * to, a cycle where a record goes back.
 *
 * <h3>What it draws</h3>
 *
 * - One node per live step, labelled with its sequence, name, the office holding
 *   it and the status it confers.
 * - The initial and final steps in their own shape and colour, so the ends of the
 *   route are visible at a glance.
 * - One arrow per live connection.
 * - A step with no arrows at all is still drawn. It is not noise — it is a step
 *   someone created and never wired, and the diagram is the fastest way to
 *   notice.
 *
 * Mermaid is initialised once in `main.ts`, theme included, so nothing is
 * configured here.
 */
@Component({
  selector: 'workflow-diagram',
  template: `
    <div class="flex flex-col gap-3 p-4">
      @if (loading()) {
        <p class="text-sm text-gray-500">Drawing the route…</p>
      } @else if (error()) {
        <p class="text-sm text-red-600" role="alert">{{ error() }}</p>
      } @else if (!stepCount()) {
        <p class="text-sm text-gray-500">
          This workflow has no steps yet. Add them on the Workflow Steps screen, then draw the
          arrows between them on Workflow Connections.
        </p>
      } @else {
        <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>{{ stepCount() }} step(s)</span>
          <span>{{ edgeCount() }} connection(s)</span>
          @if (!edgeCount()) {
            <span class="text-amber-600">
              No connections drawn yet, so the steps stand on their own
            </span>
          }
        </div>
      }

      <!-- Kept in the DOM rather than behind the @if above: mermaid renders into
           it, and an element that only appears once the counts are set is not
           there when the render lands. -->
      <div
        class="w-full overflow-x-auto rounded-lg bg-white p-4"
        [class.hidden]="!stepCount()"
        [attr.aria-label]="'Diagram of this workflow, ' + stepCount() + ' steps'"
        role="img"
      >
        <div #diagram class="flex justify-center"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowDiagramComponent {
  /** The route to draw. Passed in by the workflow's detail page. */
  readonly workflowDefinitionUid = input<string>();

  private readonly diagram = viewChild<ElementRef<HTMLDivElement>>('diagram');

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly stepCount = signal(0);
  protected readonly edgeCount = signal(0);

  private readonly fs = inject(FetchService);

  constructor() {
    effect(() => {
      const uid = this.workflowDefinitionUid();
      if (uid) {
        void this.draw(uid);
      }
    });
  }

  private async draw(uid: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const variables = { workflowDefinitionUid: uid };
      // Both in flight at once: neither reads the other, and the diagram needs
      // both before it can draw anything.
      const [steps, connections] = await Promise.all([
        this.fs.fetch({ query: STEPS, variables }),
        this.fs.fetch({ query: CONNECTIONS, variables }),
      ]);

      const stepList: DiagramStep[] = steps ?? [];
      const edgeList: DiagramEdge[] = connections ?? [];

      this.stepCount.set(stepList.length);
      this.edgeCount.set(edgeList.length);

      if (stepList.length) {
        await this.render(buildMermaid(stepList, edgeList, systemPalette()));
      }
    } catch {
      this.error.set('The route could not be read. Reopen the workflow to try again.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Renders and injects the SVG.
   *
   * Deferred a tick so the host element is in the DOM: the counts were set on the
   * line above and the template has not been rendered against them yet.
   */
  private async render(definition: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));

    const host = this.diagram()?.nativeElement;
    if (!host) {
      return;
    }

    try {
      // Mermaid keys its internal state by id, so a redraw needs a fresh one.
      const { svg } = await mermaid.render(`workflow-${Date.now()}`, definition);
      host.innerHTML = svg;
    } catch {
      this.error.set('The route could not be drawn. Check for a step with an unusual name.');
    }
  }
}

interface DiagramStep {
  id: string;
  name?: string;
  sequence?: number;
  newStatus?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  role?: { name?: string };
}

interface DiagramEdge {
  parent?: { id?: string };
  child?: { id?: string };
}

const STEPS = gql`
  query workflowStepsByWorkflowDefinition($workflowDefinitionUid: String) {
    workflowStepsByWorkflowDefinition(workflowDefinitionUid: $workflowDefinitionUid) {
      id
      name
      sequence
      newStatus
      isInitial
      isFinal
      role {
        name
      }
    }
  }
`;

const CONNECTIONS = gql`
  query workflowStepConnectionsByDefinition($workflowDefinitionUid: String) {
    workflowStepConnectionsByDefinition(workflowDefinitionUid: $workflowDefinitionUid) {
      id
      parent {
        id
      }
      child {
        id
      }
    }
  }
`;

/** The theme tokens the diagram paints with, and what each one covers. */
interface Palette {
  /** Fill of an ordinary step. */
  container: string;
  /** Text on an ordinary step. */
  onContainer: string;
  /** Node borders and every arrow. */
  primary: string;
  /** Fill and text of the initial step. */
  onPrimary: string;
  /** Fill and text of the final step — approval reads as tertiary. */
  tertiary: string;
  onTertiary: string;
}

/**
 * The application's own colours, read live rather than written down here.
 *
 * Angular Material publishes the theme as `--mat-sys-*` custom properties on the
 * document, generated from the three seeds in `src/styles/_theme-colors.scss`.
 * Reading them means the diagram follows the system: retheme the application and
 * it retints, and because `styles.scss` sets `color-scheme: light dark` the same
 * tokens already answer differently in dark mode. Hardcoding hexes here would
 * have made this the one screen that ignores all of that — which is how the
 * green from another application survived in the first place.
 *
 * The fallbacks are the seeds themselves, for the case where the tokens are not
 * resolvable yet.
 */
function systemPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string): string =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    container: token('--mat-sys-primary-container', '#d3e4ff'),
    onContainer: token('--mat-sys-on-primary-container', '#00315b'),
    primary: token('--mat-sys-primary', '#14487a'),
    onPrimary: token('--mat-sys-on-primary', '#ffffff'),
    tertiary: token('--mat-sys-tertiary', '#1c7a4d'),
    onTertiary: token('--mat-sys-on-tertiary', '#ffffff'),
  };
}

/**
 * Turns the route into mermaid source.
 *
 * Node ids are positional (`n0`, `n1`) rather than the steps' uuids: mermaid ids
 * may not contain hyphens, and a uuid is nothing but. The map from uuid to node
 * id is what the edges are drawn against.
 *
 * The palette rides in on an `init` directive rather than through
 * `mermaid.initialize`, so the colours are decided per render against the theme
 * as it stands, not once at bootstrap.
 */
function buildMermaid(steps: DiagramStep[], edges: DiagramEdge[], palette: Palette): string {
  const nodeIds = new Map<string, string>();
  steps.forEach((step, index) => nodeIds.set(step.id, `n${index}`));

  const lines = [
    `%%{init: {'theme':'base','themeVariables':{` +
      `'primaryColor':'${palette.container}',` +
      `'primaryTextColor':'${palette.onContainer}',` +
      `'primaryBorderColor':'${palette.primary}',` +
      `'lineColor':'${palette.primary}'` +
      `}}}%%`,
    'graph TD',
  ];

  steps.forEach((step) => {
    const id = nodeIds.get(step.id);
    const label = labelFor(step);
    // A stadium for the two ends of the route, a rounded box for the rest.
    lines.push(step.isInitial || step.isFinal ? `${id}(["${label}"])` : `${id}("${label}")`);
  });

  edges.forEach((edge) => {
    const from = edge.parent?.id ? nodeIds.get(edge.parent.id) : undefined;
    const to = edge.child?.id ? nodeIds.get(edge.child.id) : undefined;
    // An edge whose ends are not both drawn is skipped rather than guessed at:
    // it means one of them is deactivated, and a half-arrow would mislead.
    if (from && to) {
      lines.push(`${from} --> ${to}`);
    }
  });

  const initial = steps.filter((step) => step.isInitial).map((step) => nodeIds.get(step.id));
  const final = steps.filter((step) => step.isFinal).map((step) => nodeIds.get(step.id));

  // The two ends of the route, in the system's own colours: it starts on primary
  // and finishes on tertiary, which is what approval reads as. Every other node
  // takes the container tint from the directive above.
  lines.push(
    `classDef initial fill:${palette.primary},stroke:${palette.primary},` +
      `color:${palette.onPrimary},stroke-width:2px`,
  );
  lines.push(
    `classDef final fill:${palette.tertiary},stroke:${palette.tertiary},` +
      `color:${palette.onTertiary},stroke-width:2px`,
  );
  if (initial.length) {
    lines.push(`class ${initial.join(',')} initial`);
  }
  if (final.length) {
    lines.push(`class ${final.join(',')} final`);
  }

  return lines.join('\n');
}

/** Sequence, name, holder and resulting status, on up to three lines. */
function labelFor(step: DiagramStep): string {
  const heading = [step.sequence, step.name].filter((part) => part !== null && part !== undefined);
  const parts = [heading.join('. ')];

  if (step.role?.name) {
    parts.push(step.role.name);
  }
  if (step.newStatus) {
    parts.push(`→ ${step.newStatus}`);
  }

  return parts.map(escapeLabel).join('<br/>');
}

/**
 * Quotes end a mermaid label and `<` opens a tag, so both are replaced. The rest
 * of a step's name is left alone — `securityLevel: 'loose'` is set in `main.ts`,
 * which is what lets the `<br/>` above render as a line break.
 */
function escapeLabel(value: string | number): string {
  return String(value).replace(/"/g, '\'').replace(/</g, '‹').replace(/>/g, '›');
}
