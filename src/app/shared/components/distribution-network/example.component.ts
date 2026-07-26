/**
 * Example usage of the Distribution Network Component
 *
 * Import in your component:
 * import { DistributionNetworkComponent } from '@shared/components/distribution-network/distribution-network.component';
 *
 * In your template:
 * <distribution-network
 *   [nodes]="networkNodes"
 *   [edges]="networkEdges"
 *   class="w-full h-96"
 * />
 */

import { Component, OnInit } from '@angular/core';
import {
  DistributionNetworkComponent,
  NetworkNode,
  NetworkEdge,
} from './distribution-network.component';

@Component({
  selector: 'app-distribution-example',
  imports: [DistributionNetworkComponent],
  template: `
    <div class="p-4">
      <h2>Gas Distribution Network</h2>
      <distribution-network
        [nodes]="nodes"
        [edges]="edges"
        class="w-full h-screen border rounded-lg"
      />
    </div>
  `,
  standalone: true,
})
export class DistributionNetworkExampleComponent implements OnInit {
  nodes: NetworkNode[] = [];
  edges: NetworkEdge[] = [];

  ngOnInit() {
    this.loadSampleNetwork();
  }

  private loadSampleNetwork() {
    // Sample nodes
    this.nodes = [
      // Main Plants
      { id: 'plant1', label: 'Main Plant\n(Dar es Salaam)', type: 'plant' },
      { id: 'plant2', label: 'Secondary Plant\n(Arusha)', type: 'plant' },

      // Distribution Centers
      { id: 'dc1', label: 'DC Dar East', type: 'distribution-center' },
      { id: 'dc2', label: 'DC Dar West', type: 'distribution-center' },
      { id: 'dc3', label: 'DC Arusha', type: 'distribution-center' },

      // Junctions
      { id: 'jn1', label: 'Junction 1', type: 'junction' },
      { id: 'jn2', label: 'Junction 2', type: 'junction' },
      { id: 'jn3', label: 'Junction 3', type: 'junction' },

      // Customers
      { id: 'c1', label: 'Customer A', type: 'customer' },
      { id: 'c2', label: 'Customer B', type: 'customer' },
      { id: 'c3', label: 'Customer C', type: 'customer' },
      { id: 'c4', label: 'Customer D', type: 'customer' },
      { id: 'c5', label: 'Customer E', type: 'customer' },
    ];

    // Sample edges
    this.edges = [
      // Plant to Distribution Centers
      { id: 'e1', source: 'plant1', target: 'dc1', label: '100 PSI', capacity: 1000 },
      { id: 'e2', source: 'plant1', target: 'dc2', label: '95 PSI', capacity: 800 },
      { id: 'e3', source: 'plant2', target: 'dc3', label: '90 PSI', capacity: 600 },

      // Distribution Centers to Junctions
      { id: 'e4', source: 'dc1', target: 'jn1', label: '80 PSI' },
      { id: 'e5', source: 'dc1', target: 'jn2', label: '80 PSI' },
      { id: 'e6', source: 'dc2', target: 'jn2', label: '75 PSI' },
      { id: 'e7', source: 'dc3', target: 'jn3', label: '70 PSI' },

      // Junctions to Customers
      { id: 'e8', source: 'jn1', target: 'c1', label: '50 PSI', flow: 200 },
      { id: 'e9', source: 'jn1', target: 'c2', label: '50 PSI', flow: 180 },
      { id: 'e10', source: 'jn2', target: 'c3', label: '45 PSI', flow: 150 },
      { id: 'e11', source: 'jn2', target: 'c4', label: '45 PSI', flow: 170 },
      { id: 'e12', source: 'jn3', target: 'c5', label: '40 PSI', flow: 100 },
    ];
  }
}
