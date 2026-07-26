# Distribution Network Component

A reusable Angular component for visualizing gas distribution networks using Cytoscape.js.

## Features

- **Node Types**: Plant, Distribution Center, Junction, Customer
- **Interactive**: Hover, tap, and navigate nodes
- **Layout**: Automatic hierarchical layout using COSE Bilkent algorithm
- **Customizable**: Colors, sizes, and styles for different node types
- **Responsive**: Automatically fits to container

## Installation

Already installed via:

```bash
npm install cytoscape cytoscape-cose-bilkent
```

## Usage

### 1. Import the component

```typescript
import {
  DistributionNetworkComponent,
  NetworkNode,
  NetworkEdge,
} from '@shared/components/distribution-network/distribution-network.component';
```

### 2. Define nodes and edges

```typescript
nodes: NetworkNode[] = [
  {
    id: 'plant1',
    label: 'Main Plant',
    type: 'plant',
    data: { capacity: 1000, pressure: 100 }
  },
  {
    id: 'dc1',
    label: 'Distribution Center',
    type: 'distribution-center'
  },
  {
    id: 'customer1',
    label: 'Customer A',
    type: 'customer'
  }
];

edges: NetworkEdge[] = [
  {
    id: 'e1',
    source: 'plant1',
    target: 'dc1',
    label: '100 PSI',
    capacity: 500,
    flow: 450
  }
];
```

### 3. Add to template

```html
<distribution-network [nodes]="nodes" [edges]="edges" class="w-full h-screen" />
```

## Node Types

| Type                  | Color            | Size  | Use Case                      |
| --------------------- | ---------------- | ----- | ----------------------------- |
| `plant`               | Red (#FF6B6B)    | 80x80 | Main gas plants               |
| `distribution-center` | Teal (#4ECDC4)   | 70x70 | Regional distribution centers |
| `junction`            | Yellow (#FFE66D) | 50x50 | Pipeline junctions            |
| `customer`            | Green (#95E1D3)  | 60x60 | End customers                 |

## API

### Inputs

- `@Input() nodes: NetworkNode[]` - Array of network nodes
- `@Input() edges: NetworkEdge[]` - Array of connections between nodes

### Methods

```typescript
// Fit entire network to view
fitToScreen(): void

// Center view on specific node
centerOn(nodeId: string): void
```

### Interfaces

```typescript
interface NetworkNode {
  id: string;
  label: string;
  type: 'plant' | 'distribution-center' | 'customer' | 'junction';
  data?: any;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  capacity?: number;
  flow?: number;
}
```

## Example

See [example.component.ts](./example.component.ts) for a complete working example.

## Styling

The component comes with predefined styles. To customize:

1. Modify colors in the `getStyles()` method
2. Adjust node sizes and spacing
3. Change animation duration (default: 500ms)

## Performance

- Handles up to 1000+ nodes smoothly
- Uses efficient layout algorithm (COSE Bilkent)
- Lazy rendering for better performance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
