import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Pipe, PipeTransform, ViewChild, signal } from '@angular/core'

import { IonItem, IonLabel, IonList } from '@ionic/angular/standalone'

import { SelfReflectEntry, SelfReflectFrequency, replaceFrequency } from '@strive/model'
import { SelfReflectFrequencyPipe } from '../../pipes/frequency.pipe'
import { SmartJoinPipe } from '@strive/utils/pipes/smart-join.pipe'


@Pipe({ name: 'getConfig', standalone: true })
export class GetConfigPipe implements PipeTransform {
  transform(entry: SelfReflectEntry, key: string) {
    return entry.config.find(config => config.key === key)
  }
}

@Pipe({ name: 'getQuestion', standalone: true })
export class GetQuestionPipe implements PipeTransform {
  transform(entry: SelfReflectEntry, key: string) {
    const config = entry.config.find(config => config.key === key)
    if (!config) return
    return replaceFrequency(config.question, config.frequency)
  }
}

@Component({
    selector: '[frequency][previousEntry] strive-self-reflect-previous-intention',
    templateUrl: './previous-intention.component.html',
    styleUrls: ['./previous-intention.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    SelfReflectFrequencyPipe,
    GetQuestionPipe,
    GetConfigPipe,
    IonItem,
    IonLabel,
    IonList
]
})
export class PreviousIntentionComponent implements AfterViewInit {

  hasListItems = signal<boolean>(true)

  @Input() frequency?: SelfReflectFrequency
  @Input() previousEntry?: SelfReflectEntry

  @ViewChild('list') list?: ElementRef<HTMLElement>

  get previousEntryKeys() {
    if (!this.previousEntry) return []
    return Object.keys(this.previousEntry).filter(key => {
      if (!this.previousEntry) return false
      const value = this.previousEntry[key]
      return Array.isArray(value) ? value.length : value
    })
  }

  ngAfterViewInit() {
    if (this.list && this.list.nativeElement.children.length === 0) {
      setTimeout(() => { // time out needed to reflect changes in ui
        this.hasListItems.set(false)
      }, 0)
    }
  }
}
