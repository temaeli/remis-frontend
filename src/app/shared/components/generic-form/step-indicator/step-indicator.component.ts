import { Component, OnInit, Input, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { roundToNearest } from '@core/helpers';

@Component({
  selector: 'step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss'],
})
export class StepIndicatorComponent implements OnInit {
  @Input() animation = 'move-left';
  @Input() title?: string;
  @Input() progress: any = 0;
  @Input() startIndex = 0;
  @Input() steps: any[] = [];
  @Input() mode: 'fill' | 'outline' = 'fill';
  @Input() hideInActive = false;
  @Output() goToStep = new EventEmitter<number>();
  @Output() goToSlug = new EventEmitter<string>();

  location = inject(Location);

  ngOnInit() {
    if (!this.steps) this.steps = [];
  }

  goBack() {
    this.location.back();
  }

  goToStep_(step: any) {
    this.goToStep.emit(step);
  }

  goToSlug_(slug: any) {
    this.goToSlug.emit(slug);
  }

  round(x: any) {
    return roundToNearest(x, 2);
  }

  getStepsLength() {
    return this.hideInActive
      ? this.steps.filter((s) => s.active !== false).length
      : this.steps.length;
  }
}
