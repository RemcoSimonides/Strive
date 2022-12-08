import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
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

  constructor(private supportService: SupportService) {}

  updateStatus(status: SupportStatus) {
    if (!this.support?.id) return
    this.supportService.update(this.support.id, { status, needsDecision: false }, { params: { goalId: this.support.goalId }})
    this.support.status = status
    this.support.needsDecision = false
  }
}