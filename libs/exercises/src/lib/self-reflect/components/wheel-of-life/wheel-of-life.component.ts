import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { WheelOfLifeForm } from './wheel-of-life.form'
import { aspectsConfig } from '@strive/model'
import { IonRange } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-wheel-of-life',
  templateUrl: './wheel-of-life.component.html',
  styleUrls: ['./wheel-of-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonRange
  ]
})
export class WheelOfLifeComponent {
  aspectsConfig = aspectsConfig

  @Input() form?: WheelOfLifeForm
}
