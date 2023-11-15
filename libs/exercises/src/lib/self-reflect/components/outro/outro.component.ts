import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { SelfReflectFrequency } from '@strive/model'
import { SelfReflectFrequencyPipe } from '../../pipes/frequency.pipe'

@Component({
  standalone: true,
  selector: '[frequency] strive-self-reflect-outro',
  templateUrl: './outro.component.html',
  styleUrls: ['./outro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    SelfReflectFrequencyPipe
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

}