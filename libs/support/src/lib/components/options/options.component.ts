import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Support, SupportStatus } from '@strive/support/+state/support.firestore';
import { SupportService } from '@strive/support/+state/support.service';

@Component({
  selector: 'support-options',
  templateUrl: './options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportOptionsComponent {
  @Input() support: Support
  @Input() goalId: string

  constructor(
    private popoverCtrl: PopoverController,
    private supportService: SupportService,
  ) {}

  updateStatus(status: SupportStatus) {
    this.supportService.update(this.support.id, { status }, { params: { goalId: this.goalId }})
    this.popoverCtrl.dismiss()
  }
}