import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { AssessLifeInterval } from '@strive/model'
import { AssessLifeIntervalPipe } from '../../pipes/interval.pipe'

@Component({
  standalone: true,
  selector: '[interval] strive-assess-life-outro',
  templateUrl: './outro.component.html',
  styleUrls: ['./outro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeOutroComponent implements OnInit {

  possibleNextEntries: AssessLifeInterval[] = []

  @Input() todos: AssessLifeInterval[] = []
  @Input() interval?: AssessLifeInterval
  @Output() next = new EventEmitter<AssessLifeInterval>()

  ngOnInit() {
    this.possibleNextEntries = this.todos.filter(todo => todo !== this.interval)
  }

}