export class BlobAnimator {
  private originalPath: string;
  private pathElement: SVGPathElement;
  private animationId: number | null = null;
  private time = 0;
  private isAnimating = false;

  // Enhanced parameters for smoothness
  private noiseFactor = 1.5;
  private speed = 0.09;
  smoothness = 0.8; // 0-1, higher = smoother
  phaseOffset = 0.3; // Stagger noise phases

  constructor(
    pathElement: SVGPathElement,
    options: {
      noiseFactor?: number;
      speed?: number;
      smoothness?: number;
      phaseOffset?: number;
    } = {},
  ) {
    this.pathElement = pathElement;
    this.originalPath = pathElement.getAttribute('d') || '';

    this.noiseFactor = options.noiseFactor ?? this.noiseFactor;
    this.speed = options.speed ?? this.speed;
    this.smoothness = options.smoothness ?? this.smoothness;
    this.phaseOffset = options.phaseOffset ?? this.phaseOffset;
  }

  private parsePath(path: string): { command: string; values: number[] }[] {
    const segments: { command: string; values: number[] }[] = [];
    const commandRegex = /([A-Z])([^A-Z]*)/gi;
    let match;

    while ((match = commandRegex.exec(path)) !== null) {
      const command = match[1];
      const values = match[2]
        .trim()
        .split(/[\s,]+/)
        .filter((val) => val !== '')
        .map(Number)
        .filter((num) => !isNaN(num));

      segments.push({ command, values });
    }

    return segments;
  }

  // Smooth noise function using multiple octaves for organic movement
  private smoothNoise(t: number, index: number, coordinate: 'x' | 'y'): number {
    const baseFreq = this.speed;
    const phase = index * this.phaseOffset;

    // Multi-octave noise for smoother results
    const noise1 = Math.sin(t * baseFreq + phase) * 0.5;
    const noise2 = Math.sin(t * baseFreq * 1.7 + phase * 1.3) * 0.3;
    const noise3 = Math.sin(t * baseFreq * 2.3 + phase * 1.7) * 0.2;

    const rawNoise = (noise1 + noise2 + noise3) * this.noiseFactor;

    // Apply smoothness filtering
    return this.applySmoothness(rawNoise);
  }

  // Low-pass filter to prevent sharp changes
  applySmoothness(value: number): number {
    // Simple low-pass filter - you could make this more sophisticated
    return value * this.smoothness;
  }

  // Ensure curve continuity by relating adjacent points' movement
  calculateSmoothDisplacement(
    t: number,
    pointIndex: number,
    totalPoints: number,
    prevDisplacement?: { x: number; y: number },
  ): { x: number; y: number } {
    const baseX = this.smoothNoise(t, pointIndex, 'x');
    const baseY = this.smoothNoise(t, pointIndex, 'y');

    // If we have previous displacement, blend with it for continuity
    if (prevDisplacement) {
      const continuity = 0.6; // How much to follow previous point
      return {
        x: baseX * (1 - continuity) + prevDisplacement.x * continuity,
        y: baseY * (1 - continuity) + prevDisplacement.y * continuity,
      };
    }

    return { x: baseX, y: baseY };
  }

  private morphPath(t: number): string {
    const segments = this.parsePath(this.originalPath);
    let morphedPath = '';
    let previousDisplacement: { x: number; y: number } | undefined;
    let pointIndex = 0;

    segments.forEach((segment, segmentIndex) => {
      morphedPath += segment.command;

      // For curves, ensure smooth handle placement
      const isCurve = segment.command === 'C' || segment.command === 'Q';

      for (let i = 0; i < segment.values.length; i += 2) {
        if (i + 1 < segment.values.length) {
          const x = segment.values[i];
          const y = segment.values[i + 1];

          // Calculate smooth displacement
          const displacement = this.calculateSmoothDisplacement(
            t,
            pointIndex,
            this.countTotalPoints(segments),
            previousDisplacement,
          );

          const newX = x + displacement.x;
          const newY = y + displacement.y;

          morphedPath += `${newX.toFixed(3)},${newY.toFixed(3)}`;

          if (i + 2 < segment.values.length) {
            morphedPath += ',';
          }

          previousDisplacement = displacement;
          pointIndex++;
        }
      }

      morphedPath += ' ';
    });

    return morphedPath.trim();
  }

  private countTotalPoints(segments: { command: string; values: number[] }[]): number {
    return segments.reduce((total, segment) => total + Math.floor(segment.values.length / 2), 0);
  }

  private animate = () => {
    if (!this.isAnimating) return;

    this.time++;
    const morphedPath = this.morphPath(this.time);
    if (!morphedPath) return;
    this.pathElement?.setAttribute('d', morphedPath);
    this.animationId = requestAnimationFrame(this.animate);
  };

  start(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  stop(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset(): void {
    this.stop();
    this.pathElement.setAttribute('d', this.originalPath);
    this.time = 0;
  }

  updateOptions(options: {
    noiseFactor?: number;
    speed?: number;
    smoothness?: number;
    phaseOffset?: number;
  }): void {
    this.noiseFactor = options.noiseFactor ?? this.noiseFactor;
    this.speed = options.speed ?? this.speed;
    this.smoothness = Math.max(0.1, Math.min(1, options.smoothness ?? this.smoothness));
    this.phaseOffset = options.phaseOffset ?? this.phaseOffset;
  }

  // Preset configurations for different smooth effects
  static createBreathingBlob(pathElement: SVGPathElement): BlobAnimator {
    return new BlobAnimator(pathElement, {
      noiseFactor: 1.0,
      speed: 0.001,
      smoothness: 0.9,
      phaseOffset: 0.2,
    });
  }

  static createGentleFlow(pathElement: SVGPathElement): BlobAnimator {
    return new BlobAnimator(pathElement, {
      noiseFactor: 2.0,
      speed: 0.003,
      smoothness: 0.7,
      phaseOffset: 0.4,
    });
  }

  static createSubtlePulse(pathElement: SVGPathElement): BlobAnimator {
    return new BlobAnimator(pathElement, {
      noiseFactor: 0.5,
      speed: 0.0005,
      smoothness: 0.95,
      phaseOffset: 0.1,
    });
  }
}

// Advanced: Even smoother using cubic interpolation (optional enhancement)
export class UltraBlobAnimator extends BlobAnimator {
  private previousValues: { x: number; y: number }[] = [];

  override applySmoothness(value: number): number {
    // Cubic smoothing for ultra-smooth transitions
    return value * Math.pow(this.smoothness, 2);
  }

  override calculateSmoothDisplacement(
    t: number,
    pointIndex: number,
    totalPoints: number,
    prevDisplacement?: { x: number; y: number },
  ): { x: number; y: number } {
    const baseDisplacement = super.calculateSmoothDisplacement(
      t,
      pointIndex,
      totalPoints,
      prevDisplacement,
    );

    // Additional smoothing using previous frame data
    if (this.previousValues[pointIndex]) {
      const smoothing = 0.3;
      return {
        x: baseDisplacement.x * (1 - smoothing) + this.previousValues[pointIndex].x * smoothing,
        y: baseDisplacement.y * (1 - smoothing) + this.previousValues[pointIndex].y * smoothing,
      };
    }

    this.previousValues[pointIndex] = baseDisplacement;
    return baseDisplacement;
  }
}
