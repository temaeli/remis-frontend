import { Injectable } from '@angular/core';
import {
  NetworkNode,
  NetworkEdge,
} from '@shared/components/distribution-network/distribution-network.component';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'outage' | 'demand-increase' | 'demand-decrease' | 'capacity-reduction' | 'custom';
  affectedNodeId?: string;
  parameter?: number; // Percentage change
}

export interface SimulationResult {
  scenario: SimulationScenario;
  affectedNodes: string[];
  affectedEdges: string[];
  pressureChanges: Map<string, number>;
  flowChanges: Map<string, number>;
  criticalNodes: string[];
  totalCapacityLoss: number;
  impactedCustomers: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkSimulationService {
  /**
   * Simulate a plant outage scenario
   */
  simulatePlantOutage(
    nodes: NetworkNode[],
    edges: NetworkEdge[],
    plantId: string,
  ): SimulationResult {
    const scenario: SimulationScenario = {
      id: `outage-${plantId}-${Date.now()}`,
      name: `Plant Outage: ${nodes.find((n) => n.id === plantId)?.label || plantId}`,
      description: 'Simulates a complete shutdown of a production plant',
      type: 'outage',
      affectedNodeId: plantId,
    };

    const affectedNodes = this.findDownstreamNodes(plantId, edges);
    const affectedEdges = this.findDownstreamEdges(affectedNodes, edges);
    const criticalNodes = this.identifyCriticalNodes(affectedNodes, nodes);
    const impactedCustomers = this.countImpactedCustomers(affectedNodes, nodes);

    const pressureChanges = new Map<string, number>();
    const flowChanges = new Map<string, number>();

    // Simulate pressure drops
    affectedNodes.forEach((nodeId) => {
      const edge = edges.find((e) => e.target === nodeId);
      if (edge) {
        pressureChanges.set(nodeId, -25); // 25% pressure drop
        flowChanges.set(nodeId, -(edge.flow ?? 0));
      }
    });

    return {
      scenario,
      affectedNodes,
      affectedEdges,
      pressureChanges,
      flowChanges,
      criticalNodes,
      totalCapacityLoss: this.calculateCapacityLoss(affectedNodes, nodes),
      impactedCustomers,
      timestamp: new Date(),
    };
  }

  /**
   * Simulate demand increase in a region
   */
  simulateDemandIncrease(
    nodes: NetworkNode[],
    edges: NetworkEdge[],
    regionId: string,
    percentageIncrease = 25,
  ): SimulationResult {
    const scenario: SimulationScenario = {
      id: `demand-increase-${regionId}-${Date.now()}`,
      name: `Demand Increase: +${percentageIncrease}% in ${regionId}`,
      description: `Simulates ${percentageIncrease}% surge in customer demand`,
      type: 'demand-increase',
      affectedNodeId: regionId,
      parameter: percentageIncrease,
    };

    const affectedNodes = this.findCustomersInRegion(regionId, nodes, edges);
    const affectedEdgeObjects = this.findAffectedEdges(affectedNodes, edges);
    const affectedEdges = affectedEdgeObjects.map((e) => e.id);
    const pressureChanges = new Map<string, number>();
    const flowChanges = new Map<string, number>();

    // Calculate new flow rates
    affectedEdgeObjects.forEach((edge) => {
      const currentFlow = edge.flow ?? 0;
      const newFlow = currentFlow * (1 + percentageIncrease / 100);
      flowChanges.set(edge.id, newFlow - currentFlow);

      // Pressure drops proportionally to increased flow
      const pressureDrop = (percentageIncrease / 100) * 15; // ~15% pressure drop per 25% demand increase
      pressureChanges.set(edge.id, -pressureDrop);
    });

    return {
      scenario,
      affectedNodes,
      affectedEdges,
      pressureChanges,
      flowChanges,
      criticalNodes: this.identifyStressedPipelines(pressureChanges),
      totalCapacityLoss: 0,
      impactedCustomers: affectedNodes.filter(
        (n) => nodes.find((nd) => nd.id === n)?.type === 'customer',
      ).length,
      timestamp: new Date(),
    };
  }

  /**
   * Simulate capacity reduction (pipeline damage, maintenance, etc.)
   */
  simulateCapacityReduction(
    nodes: NetworkNode[],
    edges: NetworkEdge[],
    edgeId: string,
    percentageReduction = 50,
  ): SimulationResult {
    const edge = edges.find((e) => e.id === edgeId);
    const scenario: SimulationScenario = {
      id: `capacity-reduction-${edgeId}-${Date.now()}`,
      name: `Pipeline Damage: ${percentageReduction}% capacity loss`,
      description: `Simulates damage to pipeline reducing capacity by ${percentageReduction}%`,
      type: 'capacity-reduction',
      parameter: percentageReduction,
    };

    const affectedNodes = [edge?.target].filter(Boolean) as string[];
    const affectedEdges = [edgeId];
    const pressureChanges = new Map<string, number>();
    const flowChanges = new Map<string, number>();

    if (edge) {
      const maxFlow = edge.capacity ?? 0;
      const currentFlow = edge.flow ?? 0;
      const availableCapacity = maxFlow * (1 - percentageReduction / 100);
      const flowReduction = currentFlow - Math.min(currentFlow, availableCapacity);

      flowChanges.set(edgeId, -flowReduction);
      pressureChanges.set(edgeId, -20); // Significant pressure drop
    }

    return {
      scenario,
      affectedNodes,
      affectedEdges,
      pressureChanges,
      flowChanges,
      criticalNodes: this.findAlternativeRoutes(edgeId, nodes, edges),
      totalCapacityLoss: (percentageReduction / 100) * (edge?.capacity || 0),
      impactedCustomers: this.countDownstreamCustomers(affectedNodes, nodes, edges),
      timestamp: new Date(),
    };
  }

  /**
   * Get available simulation scenarios
   */
  getScenarios(nodes: NetworkNode[], edges: NetworkEdge[]): SimulationScenario[] {
    const plants = nodes.filter((n) => n.type === 'plant');
    const dcs = nodes.filter((n) => n.type === 'distribution-center');

    return [
      // Plant outage scenarios
      ...plants.map((plant) => ({
        id: `plant-outage-${plant.id}`,
        name: `Simulate ${plant.label} Shutdown`,
        description: `Simulate complete outage of ${plant.label}`,
        type: 'outage' as const,
        affectedNodeId: plant.id,
      })),

      // Demand scenarios
      ...dcs.map((dc) => ({
        id: `demand-increase-${dc.id}`,
        name: `+25% Demand in ${dc.label}`,
        description: `Simulate 25% surge in ${dc.label} region`,
        type: 'demand-increase' as const,
        affectedNodeId: dc.id,
        parameter: 25,
      })),

      ...dcs.map((dc) => ({
        id: `demand-decrease-${dc.id}`,
        name: `-15% Demand in ${dc.label}`,
        description: `Simulate 15% drop in ${dc.label} region`,
        type: 'demand-decrease' as const,
        affectedNodeId: dc.id,
        parameter: -15,
      })),

      // Capacity scenarios
      ...edges.slice(0, 5).map((edge) => ({
        id: `capacity-loss-${edge.id}`,
        name: `50% Capacity Loss: ${edge.id}`,
        description: `Simulate pipeline damage with 50% capacity reduction`,
        type: 'capacity-reduction' as const,
        parameter: 50,
      })),
    ];
  }

  // Helper methods

  private findDownstreamNodes(sourceId: string, edges: NetworkEdge[]): string[] {
    const downstream = new Set<string>();
    const queue = [sourceId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = edges.filter((e) => e.source === current);

      outgoing.forEach((edge) => {
        if (!downstream.has(edge.target)) {
          downstream.add(edge.target);
          queue.push(edge.target);
        }
      });
    }

    return Array.from(downstream);
  }

  private findDownstreamEdges(nodeIds: string[], edges: NetworkEdge[]): string[] {
    return edges
      .filter((e) => nodeIds.includes(e.source) || nodeIds.includes(e.target))
      .map((e) => e.id);
  }

  private findCustomersInRegion(
    regionId: string,
    nodes: NetworkNode[],
    edges: NetworkEdge[],
  ): string[] {
    const downstreamNodes = this.findDownstreamNodes(regionId, edges);
    return downstreamNodes.filter((id) => nodes.find((n) => n.id === id)?.type === 'customer');
  }

  private findAffectedEdges(nodeIds: string[], edges: NetworkEdge[]): NetworkEdge[] {
    return edges.filter(
      (e) =>
        nodeIds.includes(e.source) ||
        nodeIds.includes(e.target) ||
        (nodeIds.includes(e.source) && nodeIds.includes(e.target)),
    );
  }

  private identifyCriticalNodes(affectedNodes: string[], nodes: NetworkNode[]): string[] {
    return affectedNodes.filter((id) => {
      const node = nodes.find((n) => n.id === id);
      return node?.type === 'plant' || node?.type === 'distribution-center';
    });
  }

  private identifyStressedPipelines(pressureChanges: Map<string, number>): string[] {
    return Array.from(pressureChanges.entries())
      .filter(([_, change]) => change < -20)
      .map(([id, _]) => id);
  }

  private findAlternativeRoutes(
    edgeId: string,
    nodes: NetworkNode[],
    edges: NetworkEdge[],
  ): string[] {
    // Find pipelines that could serve as alternatives
    const edgeNodeIds = new Set<string>();
    edges.forEach((e) => {
      if (e.id === edgeId) {
        edgeNodeIds.add(e.source);
        edgeNodeIds.add(e.target);
      }
    });

    return edges
      .filter(
        (e) =>
          e.id !== edgeId &&
          ((edgeNodeIds.has(e.source) && e.capacity && e.capacity > 0) ||
            edgeNodeIds.has(e.target)),
      )
      .map((e) => e.id);
  }

  private calculateCapacityLoss(affectedNodes: string[], nodes: NetworkNode[]): number {
    return affectedNodes
      .map((id) => {
        const node = nodes.find((n) => n.id === id);
        return node?.data?.capacity || 0;
      })
      .reduce((sum, cap) => sum + cap, 0);
  }

  private countImpactedCustomers(affectedNodes: string[], nodes: NetworkNode[]): number {
    return affectedNodes.filter((id) => nodes.find((n) => n.id === id)?.type === 'customer').length;
  }

  private countDownstreamCustomers(
    nodeIds: string[],
    nodes: NetworkNode[],
    edges: NetworkEdge[],
  ): number {
    const allDownstream = new Set<string>();

    nodeIds.forEach((id) => {
      const downstream = this.findDownstreamNodes(id, edges);
      downstream.forEach((d) => allDownstream.add(d));
    });

    return Array.from(allDownstream).filter(
      (id) => nodes.find((n) => n.id === id)?.type === 'customer',
    ).length;
  }
}
