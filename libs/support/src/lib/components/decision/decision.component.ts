import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Support, SupportStatus } from '@strive/model'
import { SupportService } from '../..//support.service'
import { IonButton } from '@ionic/angular/standalone'

@Component({
    selector: '[support] strive-support-decision',
    templateUrl: './decision.component.html',
    styleUrls: ['./decision.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonButton
    ]
})
export class SupportDecisionComponent {

  @Input() support?: Support
  @Input() counter = false

  constructor(private supportService: SupportService) { }

  updateStatus(status: SupportStatus) {
    if (!this.support?.id) return

    if (this.counter) {
      this.supportService.update(this.support.id, {
        counterStatus: status,
        counterNeedsDecision: false
      }, { params: { goalId: this.support.goalId } })
      this.support.counterStatus = status
      this.support.counterNeedsDecision = false
    } else {
      this.supportService.update(this.support.id, {
        status,
        needsDecision: false
      }, { params: { goalId: this.support.goalId } })
      this.support.status = status
      this.support.needsDecision = false
    }
  }
}
