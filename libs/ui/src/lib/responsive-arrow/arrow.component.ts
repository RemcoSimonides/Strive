import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'strive-arrow-forward',
  template: `
    <div class="line line-right" [ngStyle]="{'background-color': color}"></div>
    <i class="arrow arrow-right" [ngStyle]="{'border-color': color}"></i>
  `,
  styleUrls: ['./arrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrowForwardComponent {
  @Input() color = 'var(--ion-color-primary)'
}

@Component({
  selector: 'strive-arrow-back',
  template: `
    <i class="arrow arrow-left" [ngStyle]="{'border-color': color}"></i>
    <div class="line line-left" [ngStyle]="{'background-color': color}"></div>
  `,
  styleUrls: ['./arrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrowBackComponent {
  @Input() color = 'var(--ion-color-primary)'
}