import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'notification',
  templateUrl: 'notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {

  @Input() goalId: string
  @Input() notification: Notification
  @Input() isAdmin: boolean
  @Input() reference: string

  sourcePageRef: string
  isFromPerson: boolean = false;

  constructor(
    private user: UserService,
    private cdr: ChangeDetectorRef,
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {

    // determine source page reference
    const source = this.notification.source
    if (!!source.userId) {
      this.sourcePageRef = `/profile/${source.userId}`
      this.isFromPerson = true
    } else if (!!source.collectiveGoalId) {
      this.sourcePageRef = `/collective-goal/${source.collectiveGoalId}`
    } else if (!!source.goalId) {
      this.sourcePageRef = `/goal/${source.goalId}`
    } else {
      this.sourcePageRef = ''
    }
  }

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

  async openDiscussion(): Promise<void> {
    // const modal = await this.modalCtrl.create({
    //   component: DiscussionModalPage,
    //   componentProps: {
    //     discussionId: this.notification.discussionId,
    //   }
    // })
    // await modal.present()
  }

  public async handleRequestDecision(notification: Notification<GoalRequest>, isAccepted: boolean) {
    notification.meta.requestStatus = isAccepted ? 'accepted' : 'rejected'

    await this.goalStakeholderService.upsert({
      uid: notification.meta.uidRequestor,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: notification.source.goalId }})

    await this.notificationService.upsert(this.user.uid, notification.id, { meta: notification.meta })
  }

  public async chooseReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.decisionStatus === 'finalized') return

    const stakeholders: GoalStakeholder[] = await this.db.colWithIds$<GoalStakeholder[]>(`Goals/${notification.source.goalId}/GStakeholders`, ref => ref.where('isAchiever', '==', true)).pipe(take(1)).toPromise()

    const chooseAchieverModal = await this.modalCtrl.create({
      component: ChooseAchieverModal,
      componentProps: {
        stakeholders: stakeholders
      }
    })
    chooseAchieverModal.onDidDismiss().then(data => {
      if (!!data.data) {
        support.receiver = data.data
        this.cdr.markForCheck();
      }
    })

    await chooseAchieverModal.present()
  }

  public async removeReceiver(notification: Notification<SupportDecisionMeta>, support: NotificationSupport) {
    if (!isSupportDecisionNotification(notification)) return
    if (notification.meta.decisionStatus === 'finalized') return
    support.receiver = createProfileLink();
  }

  public async finalizeDecision(notification: Notification<SupportDecisionMeta>) {
    await this.notificationService.finalizeDecision(notification)
    notification.meta.decisionStatus = 'finalized'
  }

}