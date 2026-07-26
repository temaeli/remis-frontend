import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register the COSE Bilkent layout
cytoscape.use(coseBilkent);

export interface NetworkNode {
  id: string;
  label: string;
  type: 'plant' | 'distribution-center' | 'customer' | 'junction';
  data?: any;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  capacity?: number;
  flow?: number;
}

@Component({
  selector: 'distribution-network',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="network-container" #cyContainer></div> `,
  styles: [
    `
      .network-container {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionNetworkComponent implements AfterViewInit {
  @Input() nodes: NetworkNode[] = [];
  @Input() edges: NetworkEdge[] = [];
  @ViewChild('cyContainer') cyContainer!: ElementRef;

  private cy!: Core;

  ngAfterViewInit() {
    if (this.cyContainer) {
      this.initializeNetwork();
      this.renderNetwork();
    }
  }

  private initializeNetwork() {
    if (!this.cyContainer) return;

    const container = this.cyContainer.nativeElement;
    const elements = this.convertToElementsFormat();

    this.cy = cytoscape({
      container,
      elements,
      style: this.getStyles() as any,
      wheelSensitivity: 0.1,
    });
  }

  private renderNetwork() {
    if (!this.cy) return;

    const layout = this.cy.layout({
      name: 'cose-bilkent',
      animate: true,
      animationDuration: 500,
      animationEasing: 'ease-out',
      nodeSeparation: 100,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 10,
      tilingPaddingHorizontal: 10,
      gravityRange: 200,
    } as any);

    layout.run();
    this.setupInteractions();
  }

  private convertToElementsFormat(): ElementDefinition[] {
    const elements: ElementDefinition[] = [];

    // Add nodes
    this.nodes.forEach((node) => {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          ...node.data,
        },
      });
    });

    // Add edges
    this.edges.forEach((edge) => {
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || '',
          capacity: edge.capacity,
          flow: edge.flow,
        },
      });
    });

    return elements;
  }

  private getStyles() {
    return [
      {
        selector: 'node',
        style: {
          'content': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#fff',
          'border-width': 2,
          'font-size': 12,
          'padding': 10,
        },
      },
      {
        selector: 'node[type="plant"]',
        style: {
          'background-color': '#FF6B6B',
          'border-color': '#C92A2A',
          'color': '#fff',
          'width': 80,
          'height': 80,
        },
      },
      {
        selector: 'node[type="distribution-center"]',
        style: {
          'background-color': '#4ECDC4',
          'border-color': '#0B8B88',
          'color': '#fff',
          'width': 70,
          'height': 70,
        },
      },
      {
        selector: 'node[type="junction"]',
        style: {
          'background-color': '#FFE66D',
          'border-color': '#D4A500',
          'width': 50,
          'height': 50,
        },
      },
      {
        selector: 'node[type="customer"]',
        style: {
          'background-color': '#95E1D3',
          'border-color': '#38A169',
          'width': 60,
          'height': 60,
        },
      },
      {
        selector: 'edge',
        style: {
          'line-color': '#999',
          'target-arrow-color': '#999',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'width': 2,
          'label': 'data(label)',
          'font-size': 10,
          'text-background-color': '#fff',
          'text-background-opacity': 0.8,
          'text-background-padding': 2,
        },
      },
      {
        selector: 'node:hover',
        style: {
          'background-opacity': 0.8,
          'border-width': 3,
          'box-shadow': '0 0 10px rgba(0, 0, 0, 0.3)',
        },
      },
      {
        selector: 'edge:hover',
        style: {
          'line-color': '#333',
          'target-arrow-color': '#333',
          'width': 3,
        },
      },
    ];
  }

  private setupInteractions() {
    if (!this.cy) return;

    // Tap to select
    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      node.classList.add('selected');
    });

    // Fit to screen with padding
    setTimeout(() => {
      this.cy.fit(undefined, 50);
    }, 600);
  }

  fitToScreen() {
    if (this.cy) {
      this.cy.fit(undefined, 50);
    }
  }

  centerOn(nodeId: string) {
    if (this.cy) {
      const node = this.cy.$(`#${nodeId}`);
      if (node.length > 0) {
        this.cy.center(node);
      }
    }
  }
}
