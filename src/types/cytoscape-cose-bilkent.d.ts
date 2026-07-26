declare module 'cytoscape-cose-bilkent' {
  interface CoseBilkentOptions {
    // Layout name
    name?: string;

    // Layout options
    animateFilter?: (node: any, i: number) => boolean;
    animationDuration?: number;
    animationEasing?: string;
    animateOnDrawing?: boolean;
    avoidOverlap?: boolean;
    avoidOverlapPadding?: number;
    nodeDimensionsIncludeLabels?: boolean;
    spacingFactor?: number;
    coolingFactor?: number;
    edgeElasticity?: number | ((edge: any) => number);
    nestingFactor?: number;
    gravity?: number;
    numIter?: number;
    initialTemp?: number;
    minTemp?: number;
    quality?: number;
    tile?: boolean;
    tilingPaddingVertical?: number;
    tilingPaddingHorizontal?: number;
    gravityRange?: number;
    nodeSpacing?: number | ((node: any) => number);
    randomize?: boolean;
    // Node and container positioning
    container?: HTMLElement | string;
    nodes?: any;
    edges?: any;
  }

  function register(cy: any): void;

  export = register;
}
