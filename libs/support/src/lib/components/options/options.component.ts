import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { Support, SupportStatus } from '@strive/model'
import { SupportService } from '@strive/support/support.service'

@Component({
  selector: '[support] support-options',
  templateUrl: './options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportOptionsComponent {
  @Input() support!: Support

  constructor(
    private popoverCtrl: PopoverController,
    private supportService: SupportService,
  ) {}

  updateStatus(status: SupportStatus) {
    if (!this.support.id) return
    this.supportService.update(this.support.id, { status }, { params: { goalId: this.support.source.goal.id }})
    this.popoverCtrl.dismiss()
  }
}