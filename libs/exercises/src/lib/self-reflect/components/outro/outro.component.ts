import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { SelfReflectFrequency } from '@strive/model'
import { addIcons } from 'ionicons'
import { arrowForwardOutline } from 'ionicons/icons'
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone'

@Component({
    selector: '[frequency] strive-self-reflect-outro',
    templateUrl: './outro.component.html',
    styleUrls: ['./outro.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        IonList,
        IonItem,
        IonLabel,
        IonIcon
    ]
})
export class SelfReflectOutroComponent implements OnInit {

  possibleNextEntries: SelfReflectFrequency[] = []

  @Input() todos: SelfReflectFrequency[] = []
  @Input() frequency?: SelfReflectFrequency
  @Output() next = new EventEmitter<SelfReflectFrequency>()

  ngOnInit() {
    this.possibleNextEntries = this.todos.filter(todo => todo !== this.frequency)
  }

  constructor() {
    addIcons({ arrowForwardOutline })
  }
}