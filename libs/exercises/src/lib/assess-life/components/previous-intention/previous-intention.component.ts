import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { AssessLifeEntry, AssessLifeInterval } from '@strive/model'
import { AssessLifeIntervalPipe } from '../../pipes/interval.pipe'
import { SmartJoinPipe } from '@strive/utils/pipes/smart-join.pipe'

@Component({
  standalone: true,
  selector: '[interval][previousEntry] strive-assess-life-previous-intention',
  templateUrl: './previous-intention.component.html',
  styleUrls: ['./previous-intention.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    AssessLifeIntervalPipe,
    SmartJoinPipe
  ]
})
export class PreviousIntentionComponent {

  @Input() interval?: AssessLifeInterval
  @Input() previousEntry?: AssessLifeEntry
}