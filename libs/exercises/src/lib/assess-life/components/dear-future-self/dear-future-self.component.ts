import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeIntervalPipe } from '../../pipes/interval.pipe'
import { AssessLifeInterval } from '@strive/model'
import { DearFutureSelfForm } from './dear-future-self.form'

@Component({
  standalone: true,
  selector: 'strive-assess-life-dear-future-self',
  templateUrl: './dear-future-self.component.html',
  styleUrls: ['./dear-future-self.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeDearFutureSelfComponent {

  @Input() interval?: AssessLifeInterval
  @Input() form?: DearFutureSelfForm

}