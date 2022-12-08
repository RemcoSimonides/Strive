import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AlertController, ModalController, Platform } from '@ionic/angular'
import { Support, SupportStatus } from '@strive/model'
import { SupportService } from '@strive/support/support.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  selector: 'support-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDetailsComponent extends ModalDirective {

  @Input() support?: Support

  constructor(
    private alertCtrl: AlertController,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private supportService: SupportService
  ) {
    super(location, modalCtrl, platform)
  }

  updateStatus(status: SupportStatus) {
    if (!this.support?.id) return

    this.supportService.update(this.support.id, { status }, { params: { goalId: this.support.goalId }})
  }

  give() {
    if (!this.support?.id) return

    this.alertCtrl.create({
      subHeader: `The ${this.support.milestoneId ? 'milestone' : 'goal'} is not completed yet`,
      message: `Are you sure you want to give this support already?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => this.updateStatus('waiting_to_be_paid')
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  remove() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to remove this support?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (!this.support?.id) return
            this.supportService.remove(this.support.id, { params: { goalId: this.support.goalId }})
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