import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { where } from '@angular/fire/firestore';

// Strive
import { Notification, SupportDecisionMeta, GoalRequest } from '@strive/notification/+state/notification.firestore';
import { NotificationOptionsPopoverComponent } from '@strive/notification/components/notification-options/notification-options.component';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { NotificationSupport } from '@strive/support/+state/support.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { ChooseAchieverModalComponent } from '../choose-achiever/choose-achiever-modal.page';
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { DiscussionModalComponent } from '@strive/discussion/components/discussion-modal/discussion-modal.component';
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';


@Pipe({ name: 'source' })
export class SourcePipe implements PipeTransform {
  transform(link: string): 'user' | 'goal' | 'collectiveGoal' {
    if (link.includes('profile')) return 'user'
    if (link.includes('collective-goal')) return 'collectiveGoal'
    return 'goal'
  }
}

@Component({
  selector: '[notification][reference][isAdmin] notification-main',
  templateUrl: 'notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  @Input() goalId: string
  @Input() notification: Notification
  @Input() isAdmin: boolean
  @Input() reference: string

  constructor(
    private user: UserService,
    private cdr: ChangeDetectorRef,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) { }

  async openNotificationOptions(event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: NotificationOptionsPopoverComponent,
      event: event,
      componentProps: {
        isAdmin: this.isAdmin,
        reference: this.reference
      }
    })
    await popover.present()
    await popover.onDidDismiss().then(result => {
      if (result.data.remove) {
        this.notification = undefined
      }
    })
  }

  openDiscussion() {
    if (this.user.uid) {
      this.modalCtrl.create({
        component: DiscussionModalComponent,
        componentProps: {
          discussionId: this.notification.discussionId,
        }
      }).then(modal => modal.present())
    } else {
      this.modalCtrl.create({
        component: AuthModalModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      }).then(modal => modal.present())
    }
  }

  async handleRequestDecision(notification: Notification<GoalRequest>, isAccepted: boolean) {
    notification.meta.status = isAccepted ? 'accepted' : 'rejected'

    await this.goalStakeholderService.upsert({
      uid: notification.meta.uidRequestor,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: notification.source.goal.id }})

    await this.notificationService.update(notification.id, { needsDecision: false, meta: notification.meta }, { params: { uid: this.user.uid }})
  }

  async chooseReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.status === 'finalized') return

    const stakeholders = await this.goalStakeholderService.getValue([where('isAchiever', '==', true)], { goalId: notification.source.goal.id })

    const chooseAchieverModal = await this.modalCtrl.create({
      component: ChooseAchieverModalComponent,
      componentProps: { stakeholders }
    })
    chooseAchieverModal.onDidDismiss().then(data => {
      if (data.data) {
        support.receiver = data.data
        this.cdr.markForCheck();
      }
    })
    chooseAchieverModal.present()
  }

  public async removeReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.status === 'finalized') return
    support.receiver = createUserLink();
  }

  public async finalizeDecision(notification: Notification<SupportDecisionMeta>) {
    await this.notificationService.finalizeDecision(notification)
    notification.meta.status = 'finalized'
    this.cdr.markForCheck()
  }

}