import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { SelfReflectInterval } from '@strive/model'
import { SelfReflectIntervalPipe } from '../../pipes/interval.pipe'

@Component({
  standalone: true,
  selector: '[interval] strive-self-reflect-outro',
  templateUrl: './outro.component.html',
  styleUrls: ['./outro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    SelfReflectIntervalPipe
  ]
})
export class SelfReflectOutroComponent implements OnInit {

  possibleNextEntries: SelfReflectInterval[] = []

  @Input() todos: SelfReflectInterval[] = []
  @Input() interval?: SelfReflectInterval
  @Output() next = new EventEmitter<SelfReflectInterval>()

  ngOnInit() {
    this.possibleNextEntries = this.todos.filter(todo => todo !== this.interval)
  }

}