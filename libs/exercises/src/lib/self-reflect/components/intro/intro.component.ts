import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { SelfReflectFrequency } from '@strive/model'
import { GetMonthNamePipe } from '@strive/utils/pipes/date-fns.pipe'

@Component({
  standalone: true,
  selector: '[id][frequency] strive-self-reflect-intro',
  templateUrl: './intro.component.html',
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
    GetMonthNamePipe
  ]
})
export class SelfReflectIntroComponent {

  week = 0
  month = 0
  quarter = 0
  year = 0

  @Input() frequency?: SelfReflectFrequency
  @Input() set id(id: string | undefined) {
    if (!id) return
    const [year, quarter, month, week] = id.split('-')
    this.year = parseInt(year)
    this.quarter = parseInt(quarter)
    this.month = parseInt(month)
    this.week = parseInt(week)
  }

}