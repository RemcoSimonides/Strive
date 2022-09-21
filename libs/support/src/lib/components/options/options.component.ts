import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AlertController, PopoverController } from '@ionic/angular'
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
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private supportService: SupportService,
  ) {}

  updateStatus(status: SupportStatus) {
    if (!this.support.id) return
    this.supportService.update(this.support.id, { status }, { params: { goalId: this.support.goalId }})
    this.popoverCtrl.dismiss()
  }

  give() {
    this.alertCtrl.create({
      subHeader: `The ${this.support.milestoneId ? 'milestone' : 'goal'} is not completed yet`,
      message: `Are you sure you want to give this support already?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!this.support.id) return
            this.supportService.update(this.support.id, { status: 'waiting_to_be_paid' }, { params: { goalId: this.support.goalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
    this.popoverCtrl.dismiss()
  }

  remove() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to remove this support?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!this.support.id) return
            this.supportService.remove(this.support.id, { params: { goalId: this.support.goalId }})
            this.popoverCtrl.dismiss()
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
}