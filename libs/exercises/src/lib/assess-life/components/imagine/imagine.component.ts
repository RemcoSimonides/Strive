import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeIntervalPipe } from '../../pipes/interval.pipe'
import { ImagineForm } from './imagine.form'

@Component({
  standalone: true,
  selector: '[form] strive-assess-life-imagine',
  templateUrl: './imagine.component.html',
  styleUrls: ['./imagine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeImagineComponent {

  @Input() form?: ImagineForm

}