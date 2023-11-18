import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { EntryStep, SelfReflectFrequency } from '@strive/model'
import { GetMonthNamePipe } from '@strive/utils/pipes/date-fns.pipe'
import { SelfReflectFrequencyPipe } from '../../pipes/frequency.pipe'

@Component({
  standalone: true,
  selector: '[frequency][next] strive-self-reflect-intermediate',
  templateUrl: './intermediate.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
      justify-content: center;
      max-width: 300px;
      margin: auto;
      height: 100%;
      text-align: center;
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    GetMonthNamePipe,
    SelfReflectFrequencyPipe
  ]
})
export class SelfReflectIntermediateComponent {
  @Input() frequency?: SelfReflectFrequency
  @Input() next?: EntryStep['tense']
}