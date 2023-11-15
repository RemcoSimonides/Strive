import { CommonModule } from '@angular/common'
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, signal } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { SelfReflectEntry, SelfReflectFrequency } from '@strive/model'
import { SelfReflectFrequencyPipe } from '../../pipes/frequency.pipe'
import { SmartJoinPipe } from '@strive/utils/pipes/smart-join.pipe'

@Component({
  standalone: true,
  selector: '[frequency][previousEntry] strive-self-reflect-previous-intention',
  templateUrl: './previous-intention.component.html',
  styleUrls: ['./previous-intention.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    SelfReflectFrequencyPipe,
    SmartJoinPipe
  ]
})
export class PreviousIntentionComponent implements AfterViewInit {

  hasListItems = signal<boolean>(true)

  @Input() frequency?: SelfReflectFrequency
  @Input() previousEntry?: SelfReflectEntry

  @ViewChild('list') list?: ElementRef<HTMLElement>

  ngAfterViewInit() {
    if (this.list && this.list.nativeElement.children.length === 0) {
      setTimeout(() => { // time out needed to reflect changes in ui
        this.hasListItems.set(false)
      }, 0)
    }
  }
}