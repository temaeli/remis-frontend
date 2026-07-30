import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface UnitRecord {
  u: string;
  type: string;
  size: string;
  price: number;
  status: 'avail' | 'resv' | 'sold';
  buyer: string;
  mode: string;
  billing: string;
}

interface FloorLevel {
  level: number;
  name: string;
  code: string;
  units: UnitRecord[];
}

interface UnitLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

const STATUS_META = {
  avail: { cls: 'u-avail', pill: 'st-avail', label: 'Available' },
  resv: { cls: 'u-resv', pill: 'st-resv', label: 'Reserved' },
  sold: { cls: 'u-sold', pill: 'st-sold', label: 'Sold' },
} as const;

// Illustrative sample data for the interactive floor explorer — swap for real WHI records.
const LEVELS: FloorLevel[] = [
  {
    level: 0,
    name: 'Ground Floor',
    code: 'GF',
    units: [
      {
        u: 'A',
        type: '2-Bed Apartment',
        size: '78 m²',
        price: 132000000,
        status: 'sold',
        buyer: 'E. Mwakalinga (Public Servant)',
        mode: 'Mortgage',
        billing: 'Cleared',
      },
      {
        u: 'B',
        type: '2-Bed Apartment',
        size: '78 m²',
        price: 132000000,
        status: 'sold',
        buyer: 'A. Kimaro',
        mode: 'Hire Purchase',
        billing: 'Instalment 6/24',
      },
      {
        u: 'C',
        type: 'Commercial Space',
        size: '54 m²',
        price: 96000000,
        status: 'resv',
        buyer: 'Zawadi Pharmacy Ltd (BRELA verified)',
        mode: 'Full Cash',
        billing: 'Application fee paid',
      },
      {
        u: 'D',
        type: '2-Bed Apartment',
        size: '80 m²',
        price: 135000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
    ],
  },
  {
    level: 1,
    name: 'Level 1',
    code: 'L1',
    units: [
      {
        u: 'A',
        type: '3-Bed Apartment',
        size: '104 m²',
        price: 186000000,
        status: 'sold',
        buyer: 'F. Ngassa',
        mode: 'Mortgage',
        billing: 'Cleared',
      },
      {
        u: 'B',
        type: '3-Bed Apartment',
        size: '104 m²',
        price: 186000000,
        status: 'resv',
        buyer: 'P. Materu',
        mode: 'Hire Purchase',
        billing: 'Deposit paid',
      },
      {
        u: 'C',
        type: '2-Bed Apartment',
        size: '82 m²',
        price: 138000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
      {
        u: 'D',
        type: '2-Bed Apartment',
        size: '82 m²',
        price: 138000000,
        status: 'sold',
        buyer: 'S. Hamdani',
        mode: 'Full Cash',
        billing: 'Cleared',
      },
    ],
  },
  {
    level: 2,
    name: 'Level 2',
    code: 'L2',
    units: [
      {
        u: 'A',
        type: '3-Bed Apartment',
        size: '106 m²',
        price: 190000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
      {
        u: 'B',
        type: '3-Bed Apartment',
        size: '106 m²',
        price: 190000000,
        status: 'sold',
        buyer: 'R. Kessy',
        mode: 'Mortgage',
        billing: 'Cleared',
      },
      {
        u: 'C',
        type: '2-Bed Apartment',
        size: '84 m²',
        price: 142000000,
        status: 'resv',
        buyer: 'M. Lyimo',
        mode: 'Hire Purchase',
        billing: 'Deposit paid',
      },
      {
        u: 'D',
        type: '2-Bed Apartment',
        size: '84 m²',
        price: 142000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
    ],
  },
  {
    level: 3,
    name: 'Level 3',
    code: 'L3',
    units: [
      {
        u: 'A',
        type: '4-Bed Apartment',
        size: '128 m²',
        price: 236000000,
        status: 'resv',
        buyer: 'D. Shirima',
        mode: 'Mortgage',
        billing: 'Under assessment',
      },
      {
        u: 'B',
        type: '3-Bed Apartment',
        size: '108 m²',
        price: 194000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
      {
        u: 'C',
        type: '3-Bed Apartment',
        size: '108 m²',
        price: 194000000,
        status: 'sold',
        buyer: 'G. Batenga',
        mode: 'Full Cash',
        billing: 'Cleared',
      },
      {
        u: 'D',
        type: '2-Bed Apartment',
        size: '86 m²',
        price: 146000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
    ],
  },
  {
    level: 4,
    name: 'Level 4 — Penthouse',
    code: 'L4',
    units: [
      {
        u: 'A',
        type: '4-Bed Penthouse',
        size: '156 m²',
        price: 312000000,
        status: 'sold',
        buyer: 'Watumishi SACCOS',
        mode: 'Full Cash',
        billing: 'Cleared',
      },
      {
        u: 'B',
        type: '4-Bed Penthouse',
        size: '156 m²',
        price: 312000000,
        status: 'resv',
        buyer: 'H. Nyerere',
        mode: 'Mortgage',
        billing: 'Offer accepted',
      },
      {
        u: 'C',
        type: '3-Bed Apartment',
        size: '112 m²',
        price: 202000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
      {
        u: 'D',
        type: '3-Bed Apartment',
        size: '112 m²',
        price: 202000000,
        status: 'avail',
        buyer: '—',
        mode: '—',
        billing: '—',
      },
    ],
  },
];

// Fixed 4-quadrant unit layout on the 320x210 floorplan viewBox — same for every level.
const UNIT_LAYOUT: UnitLayout[] = [
  { x: 14, y: 14, w: 138, h: 82 },
  { x: 168, y: 14, w: 138, h: 82 },
  { x: 14, y: 114, w: 138, h: 82 },
  { x: 168, y: 114, w: 138, h: 82 },
];

interface NeighborPlot {
  id: string;
  code: string;
  status: 'avail' | 'resv' | 'sold';
  use: string;
  distance: string;
  frontage: string;
}

// Layout on the 340x240 neighbourhood-map viewBox — road strip runs along the bottom.
const NEIGHBOR_LAYOUT: UnitLayout[] = [
  { x: 8, y: 8, w: 100, h: 90 },
  { x: 118, y: 8, w: 100, h: 90 },
  { x: 228, y: 8, w: 104, h: 90 },
  { x: 8, y: 108, w: 100, h: 87 },
  { x: 228, y: 108, w: 104, h: 87 },
];

const SUBJECT_LAYOUT: UnitLayout = { x: 118, y: 108, w: 100, h: 87 };

const NEIGHBOR_PLOTS: NeighborPlot[] = [
  {
    id: 'n1',
    code: '04814',
    status: 'avail',
    use: 'Residential Plot',
    distance: '42m NW',
    frontage: '15m',
  },
  {
    id: 'n2',
    code: '04818',
    status: 'sold',
    use: 'Residential Plot',
    distance: '18m N',
    frontage: '14m',
  },
  {
    id: 'n3',
    code: '04822',
    status: 'resv',
    use: 'Commercial Plot',
    distance: '46m NE',
    frontage: '18m',
  },
  {
    id: 'n4',
    code: '04826',
    status: 'avail',
    use: 'Residential Plot',
    distance: '15m W',
    frontage: '14m',
  },
  {
    id: 'n5',
    code: '04833',
    status: 'sold',
    use: 'Residential Plot',
    distance: '16m E',
    frontage: '15m',
  },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private observers: IntersectionObserver[] = [];

  readonly levels = LEVELS;
  readonly unitLayout = UNIT_LAYOUT;
  readonly statusMeta = STATUS_META;
  readonly neighborPlots = NEIGHBOR_PLOTS;
  readonly neighborLayout = NEIGHBOR_LAYOUT;
  readonly subjectLayout = SUBJECT_LAYOUT;

  selectedLevel = signal<number | null>(null);
  selectedUnit = signal<UnitRecord | null>(null);
  showNeighborhood = signal(false);
  selectedNeighbor = signal<NeighborPlot | null>(null);

  currentLevel = computed<FloorLevel | null>(() => {
    const level = this.selectedLevel();
    return level === null ? null : (this.levels.find((l) => l.level === level) ?? null);
  });

  openFloor(level: number): void {
    this.selectedLevel.set(level);
    this.selectedUnit.set(null);
    queueMicrotask(() => {
      this.el.nativeElement
        .querySelector('#expPanel')
        ?.scrollIntoView({ behavior: this.prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  closeFloor(): void {
    this.selectedLevel.set(null);
    this.selectedUnit.set(null);
  }

  onFloorKey(event: KeyboardEvent, level: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFloor(level);
    }
  }

  openNeighborhood(): void {
    this.showNeighborhood.set(true);
    queueMicrotask(() => {
      this.el.nativeElement
        .querySelector('#nbhdPanel')
        ?.scrollIntoView({ behavior: this.prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  closeNeighborhood(): void {
    this.showNeighborhood.set(false);
    this.selectedNeighbor.set(null);
  }

  onDeedKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openNeighborhood();
    }
  }

  selectNeighborPlot(plot: NeighborPlot): void {
    this.selectedNeighbor.set(plot);
  }

  onNeighborKey(event: KeyboardEvent, plot: NeighborPlot): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectNeighborPlot(plot);
    }
  }

  selectUnit(unit: UnitRecord): void {
    this.selectedUnit.set(unit);
  }

  money(amount: number): string {
    return 'TZS ' + amount.toLocaleString('en-US');
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    const root = this.el.nativeElement;
    const rm = this.prefersReducedMotion();

    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll('.reveal').forEach((elx) => revealIo.observe(elx));
    this.observers.push(revealIo);

    const seal = root.querySelector('#seal');
    if (rm) {
      seal?.classList.add('stamped');
    } else {
      const parcel = root.querySelector<SVGSVGElement>('#parcel');
      if (parcel) {
        parcel.querySelectorAll('polygon').forEach((p) => {
          const len = this.geometryLength(p, 700);
          (p as unknown as SVGElement).style.setProperty('--len', String(len));
        });
        setTimeout(() => parcel.classList.add('go'), 350);
      }
      setTimeout(() => seal?.classList.add('stamped'), 1650);
    }

    const setLen = (elx: Element) => {
      elx.querySelectorAll('rect, path, line').forEach((s) => {
        const len = this.geometryLength(s, 500);
        (s as unknown as SVGElement).style.setProperty('--l', String(len));
      });
    };
    const drawIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!rm) setLen(entry.target);
            entry.target.classList.add('go');
            drawIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    ['bldg', 'plan'].forEach((id) => {
      const elx = root.querySelector('#' + id);
      if (elx) drawIo.observe(elx);
    });
    this.observers.push(drawIo);

    const ledger = root.querySelector('#ledger');
    const ledgerIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.ledger-row').forEach((r, i) => {
              (r as HTMLElement).style.animationDelay = i * 0.14 + 's';
              r.classList.add('in');
            });
            ledgerIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    if (ledger) ledgerIo.observe(ledger);
    this.observers.push(ledgerIo);

    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (!entry.isIntersecting) return;
          const to = Number(target.dataset['to']);
          if (rm) {
            target.textContent = String(to);
            countIo.unobserve(target);
            return;
          }
          let cur = 0;
          const step = Math.max(1, Math.round(to / 40));
          const timer = setInterval(() => {
            cur += step;
            if (cur >= to) {
              cur = to;
              clearInterval(timer);
            }
            target.textContent = String(cur);
          }, 26);
          countIo.unobserve(target);
        });
      },
      { threshold: 0.6 },
    );
    root.querySelectorAll('.count').forEach((c) => countIo.observe(c));
    this.observers.push(countIo);
  }

  private geometryLength(node: Element, fallback: number): number {
    try {
      const geom = node as unknown as { getTotalLength?: () => number };
      return typeof geom.getTotalLength === 'function' ? geom.getTotalLength() : fallback;
    } catch {
      return fallback;
    }
  }

  ngOnDestroy(): void {
    this.observers.forEach((o) => o.disconnect());
  }
}
