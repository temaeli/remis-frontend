import { Component, OnInit, ChangeDetectionStrategy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  DistributionNetworkComponent,
  NetworkNode,
  NetworkEdge,
} from '@shared/components/distribution-network/distribution-network.component';
import {
  NetworkSimulationService,
  SimulationScenario,
  SimulationResult,
} from '@shared/services/network-simulation.service';

@Component({
  selector: 'app-distribution-network',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    MatCardModule,
    PageHeaderComponent,
    DistributionNetworkComponent,
  ],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />

      <div class="flex flex-wrap gap-2 mb-2">
        <button mat-raised-button color="primary" (click)="network.fitToScreen()">
          <mat-icon>zoom_fit_page</mat-icon>
          Fit to Screen
        </button>

        <button
          mat-raised-button
          color="accent"
          (click)="showSimulationPanel = !showSimulationPanel"
        >
          <mat-icon>{{ showSimulationPanel ? 'close' : 'science' }}</mat-icon>
          {{ showSimulationPanel ? 'Close' : 'Run Simulation' }}
        </button>

        @if (currentSimulation()) {
          <button mat-raised-button color="warn" (click)="resetNetwork()">
            <mat-icon>restart_alt</mat-icon>
            Reset Network
          </button>
        }
      </div>

      <div class="flex gap-3 flex-1 overflow-hidden">
        <div class="flex-1 flex flex-col">
          <distribution-network
            #network
            [nodes]="networkNodes"
            [edges]="networkEdges"
            class="flex-1 border rounded-lg overflow-hidden"
          />
        </div>

        <!-- Simulation Panel -->
        @if (showSimulationPanel) {
          <mat-card class="w-80 overflow-y-auto flex flex-col gap-3 p-4">
            <h3 class="font-bold text-lg">Network Simulation</h3>

            @if (!currentSimulation()) {
              <mat-form-field class="w-full">
                <mat-label>Select Scenario</mat-label>
                <mat-select [(value)]="selectedScenario">
                  @for (scenario of scenarios(); track scenario.id) {
                    <mat-option [value]="scenario">
                      {{ scenario.name }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                (click)="runSimulation()"
                [disabled]="!selectedScenario"
              >
                <mat-icon>play_arrow</mat-icon>
                Run Simulation
              </button>
            }

            @if (currentSimulation()) {
              <div class="border-t pt-3">
                <h4 class="font-semibold mb-2">{{ currentSimulation()!.scenario.name }}</h4>
                <p class="text-sm text-gray-600 mb-3">
                  {{ currentSimulation()!.scenario.description }}
                </p>

                <div class="bg-orange-50 p-3 rounded text-sm space-y-2">
                  <div>
                    <strong>Affected Nodes:</strong> {{ currentSimulation()!.affectedNodes.length }}
                  </div>
                  <div>
                    <strong>Impacted Customers:</strong>
                    {{ currentSimulation()!.impactedCustomers }}
                  </div>
                  <div>
                    <strong>Capacity Loss:</strong>
                    {{ currentSimulation()!.totalCapacityLoss | number: '1.0-0' }} PSI
                  </div>
                  @if (currentSimulation()!.criticalNodes.length > 0) {
                    <div class="bg-red-100 p-2 rounded mt-2">
                      <strong class="text-red-700">Critical:</strong>
                      <p class="text-xs text-red-600 mt-1">
                        {{ currentSimulation()!.criticalNodes.length }} nodes at risk
                      </p>
                    </div>
                  }
                </div>

                <div class="mt-3 text-xs text-gray-500">
                  Simulated at {{ currentSimulation()!.timestamp | date: 'short' }}
                </div>
              </div>
            }
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep .size-full {
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionNetworkPage extends BaseComponent implements OnInit {
  override title = 'Distribution Network';
  override subtitle = 'Gas Pipeline Network Visualization';

  @ViewChild('network') networkComponent!: DistributionNetworkComponent;

  networkNodes: NetworkNode[] = [];
  networkEdges: NetworkEdge[] = [];

  scenarios = signal<SimulationScenario[]>([]);
  currentSimulation = signal<SimulationResult | null>(null);
  selectedScenario: SimulationScenario | null = null;
  showSimulationPanel = false;

  originalNodes: NetworkNode[] = [];
  originalEdges: NetworkEdge[] = [];

  constructor(private simulationService: NetworkSimulationService) {
    super();
  }

  ngOnInit() {
    this.loadNetworkData();
    this.initializeScenarios();
  }

  private initializeScenarios() {
    const availableScenarios = this.simulationService.getScenarios(
      this.networkNodes,
      this.networkEdges,
    );
    this.scenarios.set(availableScenarios);
  }

  runSimulation() {
    if (!this.selectedScenario) return;

    let result: SimulationResult;

    switch (this.selectedScenario.type) {
      case 'outage':
        result = this.simulationService.simulatePlantOutage(
          this.networkNodes,
          this.networkEdges,
          this.selectedScenario.affectedNodeId || '',
        );
        break;

      case 'demand-increase':
        result = this.simulationService.simulateDemandIncrease(
          this.networkNodes,
          this.networkEdges,
          this.selectedScenario.affectedNodeId || '',
          this.selectedScenario.parameter || 25,
        );
        break;

      case 'capacity-reduction':
        result = this.simulationService.simulateCapacityReduction(
          this.networkNodes,
          this.networkEdges,
          this.selectedScenario.affectedNodeId || '',
          this.selectedScenario.parameter || 50,
        );
        break;

      default:
        return;
    }

    this.currentSimulation.set(result);
    this.visualizeSimulation(result);
  }

  private visualizeSimulation(result: SimulationResult) {
    // Update node colors based on affected nodes
    this.networkNodes = this.networkNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isAffected: result.affectedNodes.includes(node.id),
        isCritical: result.criticalNodes.includes(node.id),
      },
    }));

    // Update edge visualization
    this.networkEdges = this.networkEdges.map((edge) => ({
      ...edge,
      label: result.affectedEdges.includes(edge.id) ? `${edge.label} [AFFECTED]` : edge.label,
    }));
  }

  resetNetwork() {
    this.networkNodes = JSON.parse(JSON.stringify(this.originalNodes));
    this.networkEdges = JSON.parse(JSON.stringify(this.originalEdges));
    this.currentSimulation.set(null);
    this.selectedScenario = null;
  }

  private loadNetworkData() {
    // Initialize with sample network data
    // Replace with actual data from your API
    this.networkNodes = [
      // Main Plants
      {
        id: 'plant_dar',
        label: 'Main Plant\n(Dar es Salaam)',
        type: 'plant',
        data: { capacity: 5000, pressure: 100, status: 'active' },
      },
      {
        id: 'plant_arusha',
        label: 'Secondary Plant\n(Arusha)',
        type: 'plant',
        data: { capacity: 3000, pressure: 95, status: 'active' },
      },

      // Regional Distribution Centers
      {
        id: 'dc_dar_east',
        label: 'DC Dar East',
        type: 'distribution-center',
        data: { capacity: 2000, pressure: 80 },
      },
      {
        id: 'dc_dar_west',
        label: 'DC Dar West',
        type: 'distribution-center',
        data: { capacity: 1800, pressure: 78 },
      },
      {
        id: 'dc_arusha',
        label: 'DC Arusha Central',
        type: 'distribution-center',
        data: { capacity: 1500, pressure: 75 },
      },
      {
        id: 'dc_moshi',
        label: 'DC Moshi',
        type: 'distribution-center',
        data: { capacity: 1000, pressure: 72 },
      },

      // Junctions
      {
        id: 'jn_dar_1',
        label: 'Junction 1',
        type: 'junction',
        data: { type: 'main' },
      },
      {
        id: 'jn_dar_2',
        label: 'Junction 2',
        type: 'junction',
        data: { type: 'secondary' },
      },
      {
        id: 'jn_arusha_1',
        label: 'Junction A1',
        type: 'junction',
        data: { type: 'main' },
      },

      // Customers
      {
        id: 'cust_dar_1',
        label: 'Power Plant 1',
        type: 'customer',
        data: { demand: 500, type: 'industrial' },
      },
      {
        id: 'cust_dar_2',
        label: 'Ceramic Factory',
        type: 'customer',
        data: { demand: 300, type: 'industrial' },
      },
      {
        id: 'cust_dar_3',
        label: 'Commercial Zone',
        type: 'customer',
        data: { demand: 200, type: 'commercial' },
      },
      {
        id: 'cust_arusha_1',
        label: 'Power Station A',
        type: 'customer',
        data: { demand: 400, type: 'industrial' },
      },
      {
        id: 'cust_arusha_2',
        label: 'Business District',
        type: 'customer',
        data: { demand: 250, type: 'commercial' },
      },
    ];

    this.networkEdges = [
      // Plant to Distribution Centers
      {
        id: 'e_plant_dar_dc_dar_east',
        source: 'plant_dar',
        target: 'dc_dar_east',
        label: '100 PSI',
        capacity: 2000,
        flow: 1500,
      },
      {
        id: 'e_plant_dar_dc_dar_west',
        source: 'plant_dar',
        target: 'dc_dar_west',
        label: '95 PSI',
        capacity: 1800,
        flow: 1400,
      },
      {
        id: 'e_plant_arusha_dc_arusha',
        source: 'plant_arusha',
        target: 'dc_arusha',
        label: '90 PSI',
        capacity: 1500,
        flow: 1100,
      },
      {
        id: 'e_dc_arusha_dc_moshi',
        source: 'dc_arusha',
        target: 'dc_moshi',
        label: '85 PSI',
        capacity: 1000,
        flow: 800,
      },

      // Distribution Centers to Junctions
      {
        id: 'e_dc_dar_east_jn_1',
        source: 'dc_dar_east',
        target: 'jn_dar_1',
        label: '80 PSI',
      },
      {
        id: 'e_dc_dar_east_jn_2',
        source: 'dc_dar_east',
        target: 'jn_dar_2',
        label: '80 PSI',
      },
      {
        id: 'e_dc_dar_west_jn_2',
        source: 'dc_dar_west',
        target: 'jn_dar_2',
        label: '75 PSI',
      },
      {
        id: 'e_dc_arusha_jn_a1',
        source: 'dc_arusha',
        target: 'jn_arusha_1',
        label: '70 PSI',
      },

      // Junctions to Customers
      {
        id: 'e_jn_dar_1_cust_1',
        source: 'jn_dar_1',
        target: 'cust_dar_1',
        label: '50 PSI',
        flow: 500,
      },
      {
        id: 'e_jn_dar_1_cust_2',
        source: 'jn_dar_1',
        target: 'cust_dar_2',
        label: '50 PSI',
        flow: 300,
      },
      {
        id: 'e_jn_dar_2_cust_3',
        source: 'jn_dar_2',
        target: 'cust_dar_3',
        label: '45 PSI',
        flow: 200,
      },
      {
        id: 'e_jn_arusha_1_cust_a1',
        source: 'jn_arusha_1',
        target: 'cust_arusha_1',
        label: '40 PSI',
        flow: 400,
      },
      {
        id: 'e_jn_arusha_1_cust_a2',
        source: 'jn_arusha_1',
        target: 'cust_arusha_2',
        label: '40 PSI',
        flow: 250,
      },
    ];
  }
}
