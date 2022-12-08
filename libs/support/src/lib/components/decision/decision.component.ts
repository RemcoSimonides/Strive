import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { Support, SupportStatus } from '@strive/model'
import { SupportService } from '../..//support.service'

@Component({
  selector: '[support] support-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDecisionComponent {

  @Input() support?: Support
  @Output() statusChange = new EventEmitter()

  constructor(private supportService: SupportService) {}

  updateStatus(status: SupportStatus) {
    if (!this.support?.id) return
    this.supportService.update(this.support.id, { status, needsDecision: false }, { params: { goalId: this.support.goalId }})
    this.support.needsDecision = false
    this.support.status = status
  }
}