import {
  Component,
  input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow, WorkflowStep } from './workflow.models';

@Component({
  selector: 'app-workflow-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg shadow-md bg-white p-6 border border-slate-200 overflow-x-auto">
      <div #diagramContainer class="mermaid w-full"></div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mermaid {
        display: flex;
        justify-content: center;
      }

      :host ::ng-deep .mermaidTooltip {
        background-color: rgba(19, 97, 72, 0.9);
        border-radius: 4px;
        padding: 6px 12px;
        color: white;
        font-size: 12px;
        z-index: 1000;
      }

      :host ::ng-deep .node {
        fill: #f0f4f8 !important;
        stroke: #136148 !important;
        stroke-width: 2px !important;
      }

      :host ::ng-deep .node text {
        fill: #1a202c !important;
        font-size: 12px !important;
      }

      :host ::ng-deep .edgeLabel {
        background-color: #ffffff !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 4px !important;
        padding: 3px 8px !important;
        font-size: 11px !important;
      }

      :host ::ng-deep .flowchart-v2 .edge {
        stroke: #136148 !important;
        stroke-width: 2px !important;
      }

      :host ::ng-deep .flowchart-v2 .edgePath path {
        stroke: #136148 !important;
        fill: none !important;
        stroke-width: 2px !important;
      }

      :host ::ng-deep .arrowheadPath {
        fill: #136148 !important;
      }

      :host ::ng-deep .start,
      :host ::ng-deep .end {
        fill: #136148 !important;
        stroke: #0e4a35 !important;
        color: #fff !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowDiagramComponent implements OnInit {
  workflow = input.required<Workflow>();
  @ViewChild('diagramContainer') diagramContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.workflow();
      this.renderDiagram();
    });
  }

  ngOnInit(): void {
    this.renderDiagram();
  }

  private renderDiagram(): void {
    const mermaid = (window as any).mermaid;
    if (!mermaid) {
      console.error('Mermaid library not loaded');
      return;
    }

    setTimeout(async () => {
      const diagramDef = this.generateDiagram();
      if (this.diagramContainer) {
        try {
          const { svg } = await mermaid.render(
            'diagram-' + Math.random().toString(36).substr(2, 9),
            diagramDef,
          );
          this.diagramContainer.nativeElement.innerHTML = svg;
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          this.diagramContainer.nativeElement.innerHTML = '<p>Error rendering diagram</p>';
        }
      }
    }, 200);
  }

  private generateDiagram(): string {
    const steps = this.workflow().steps;
    const nodeDefinitions = this.generateNodeDefinitions(steps);
    const edgeDefinitions = this.generateEdgeDefinitions(steps);

    return `graph TD
${nodeDefinitions}
${edgeDefinitions}`;
  }

  private generateNodeDefinitions(steps: WorkflowStep[]): string {
    const nodes: string[] = ['Start["START"]'];

    steps.forEach((step) => {
      const nodeId = `Step${step.stepId}`;
      const label = `"${step.role} - ${step.action}"`;
      nodes.push(`${nodeId}[${label}]`);

      if (step.alternativeActions) {
        const altActions = Array.isArray(step.alternativeActions)
          ? step.alternativeActions
          : [step.alternativeActions];

        altActions.forEach((alt, index) => {
          const altNodeId = `Alt${step.stepId}_${index}`;
          nodes.push(`${altNodeId}["${alt}"]`);
        });
      }
    });

    nodes.push('End["COMPLETED"]');
    return nodes.join('\n');
  }

  private generateEdgeDefinitions(steps: WorkflowStep[]): string {
    const edges: string[] = ['Start --> Step1'];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nodeId = `Step${step.stepId}`;
      const nextStep = steps[i + 1];

      if (nextStep) {
        const nextNodeId = `Step${nextStep.stepId}`;
        edges.push(`${nodeId} --> ${nextNodeId}`);
      } else {
        edges.push(`${nodeId} --> End`);
      }

      if (step.alternativeActions) {
        const altActions = Array.isArray(step.alternativeActions)
          ? step.alternativeActions
          : [step.alternativeActions];

        altActions.forEach((alt, altIndex) => {
          const altNodeId = `Alt${step.stepId}_${altIndex}`;
          edges.push(`${nodeId} --> ${altNodeId}`);
          edges.push(`${altNodeId} --> End`);
        });
      }
    }

    return edges.join('\n');
  }
}
