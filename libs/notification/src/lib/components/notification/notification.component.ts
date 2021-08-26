import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { take } from 'rxjs/operators';

// Strive
import { Notification, SupportDecisionMeta, GoalRequest } from '@strive/notification/+state/notification.firestore';
import { NotificationOptionsPopover } from '@strive/notification/components/notification-options/notification-options.component';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { NotificationSupport } from '@strive/support/+state/support.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { ChooseAchieverModal } from '../choose-achiever/choose-achiever-modal.page';
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { createProfileLink } from '@strive/user/user/+state/user.firestore';
import { DiscussionModalPage } from '@strive/discussion/components/discussion-modal/discussion-modal.component';
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';


@Pipe({ name: 'source' })
export class SourcePipe implements PipeTransform {
  transform(link: string): 'user' | 'goal' | 'collectiveGoal' {
    if (link.includes('profile')) return 'user'
    if (link.includes('collective-goal')) return 'collectiveGoal'
    return 'goal'
  }
}

@Component({
  selector: '[notification][reference][isAdmin] strive-notification',
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
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) { }

  async openNotificationOptions(event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: NotificationOptionsPopover,
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
        component: DiscussionModalPage,
        componentProps: {
          discussionId: this.notification.discussionId,
        }
      }).then(modal => modal.present())
    } else {
      this.modalCtrl.create({
        component: AuthModalPage,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      }).then(modal => modal.present())
    }

  }

  public async handleRequestDecision(notification: Notification<GoalRequest>, isAccepted: boolean) {
    notification.meta.status = isAccepted ? 'accepted' : 'rejected'

    await this.goalStakeholderService.upsert({
      uid: notification.meta.uidRequestor,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: notification.source.goal.id }})

    await this.notificationService.update(notification.id, { needsDecision: false, meta: notification.meta }, { params: { uid: this.user.uid }})
  }

  public async chooseReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.status === 'finalized') return

    const stakeholders: GoalStakeholder[] = await this.db.colWithIds$<GoalStakeholder[]>(`Goals/${notification.source.goal.id}/GStakeholders`, ref => ref.where('isAchiever', '==', true)).pipe(take(1)).toPromise()

    const chooseAchieverModal = await this.modalCtrl.create({
      component: ChooseAchieverModal,
      componentProps: { stakeholders }
    })
    chooseAchieverModal.onDidDismiss().then(data => {
      if (!!data.data) {
        support.receiver = data.data
        this.cdr.markForCheck();
      }
    })
    chooseAchieverModal.present()
  }

  public async removeReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.status === 'finalized') return
    support.receiver = createProfileLink();
  }

  public async finalizeDecision(notification: Notification<SupportDecisionMeta>) {
    await this.notificationService.finalizeDecision(notification)
    notification.meta.status = 'finalized'
    this.cdr.markForCheck()
  }

}