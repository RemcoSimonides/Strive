import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { SelfReflectIntervalPipe } from '../../pipes/interval.pipe'
import { WheelOfLifeForm } from './wheel-of-life.form'
import { aspectsConfig } from '@strive/model'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-wheel-of-life',
  templateUrl: './wheel-of-life.component.html',
  styleUrls: ['./wheel-of-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SelfReflectIntervalPipe
  ]
})
export class WheelOfLifeComponent {
  aspectsConfig = aspectsConfig

  @Input() form?: WheelOfLifeForm
}