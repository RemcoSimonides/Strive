import { CommonModule } from '@angular/common'
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, signal } from '@angular/core'
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
export class PreviousIntentionComponent implements AfterViewInit {

  hasListItems = signal<boolean>(true)

  @Input() interval?: AssessLifeInterval
  @Input() previousEntry?: AssessLifeEntry

  @ViewChild('list') list?: ElementRef<HTMLElement>

  ngAfterViewInit() {
    if (this.list && this.list.nativeElement.children.length === 0) {
      setTimeout(() => { // time out needed to reflect changes in ui
        this.hasListItems.set(false)
      }, 0)
    }
  }
}