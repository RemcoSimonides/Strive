import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { take } from 'rxjs/operators';

// Strive
import { Notification, PostMeta, enumNotificationType, GoalRequest } from '@strive/notification/+state/notification.firestore';
import { NotificationOptionsPopover } from '@strive/notification/components/notification-options/notification-options.component';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { NotificationSupport } from '@strive/support/+state/support.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { ChooseAchieverModal } from '../choose-achiever/choose-achiever-modal.page';

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
  isFromPerson: boolean

  enumNotificationType = enumNotificationType

  constructor(
    private user: UserService,
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {

    // determine source page reference
    const source = this.notification.source
    console.log('source; ', source);
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
    //   component: ChatModalPage,
    //   componentProps: {
    //     discussionId: this.notification.discussionId,
    //   }
    // })
    // await modal.present()
  }

  public async handleRequestDecision(notification: Notification<GoalRequest>, isAccepted: boolean): Promise<void> {
    notification.meta.requestStatus = isAccepted ? 'accepted' : 'rejected'

    await this.goalStakeholderService.upsert(notification.meta.uidRequestor, notification.meta.goalId, {
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    })
    await this.notificationService.upsert(this.user.uid, notification.id, { meta: notification.meta })
  }

  public async chooseReceiver(notification: Notification<PostMeta>, support: NotificationSupport): Promise<void> {

    if (notification.type === enumNotificationType.evidence_finalized) return

    const stakeholders: GoalStakeholder[] = await this.db.colWithIds$<GoalStakeholder[]>(`Goals/${notification.meta.goalId}/GStakeholders`, ref => ref.where('isAchiever', '==', true)).pipe(take(1)).toPromise()

    const chooseAchieverModal = await this.modalCtrl.create({
      component: ChooseAchieverModal,
      componentProps: {
        stakeholders: stakeholders
      }
    })
    chooseAchieverModal.onDidDismiss().then((data) => {

      if (data) {
        support.receiverId = data.data.receiverId
        support.receiverUsername = data.data.receiverUsername
        support.receiverPhotoURL = data.data.receiverPhotoURL
      }

    })

    await chooseAchieverModal.present()

  }

  public async finalizeDecision(notification: Notification<PostMeta>): Promise<void> {

    await this.notificationService.finalizeDecision(notification)
    notification.type = enumNotificationType.evidence_finalized

  }

  public async removeReceiver(notification: Notification<PostMeta>, support: NotificationSupport): Promise<void> {

    if (notification.type === enumNotificationType.evidence_finalized) return

    support.receiverId = null
    support.receiverUsername = null
    support.receiverPhotoURL = null

  }
}