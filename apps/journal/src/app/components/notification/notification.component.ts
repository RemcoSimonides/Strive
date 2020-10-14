import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DiscussionPage } from '../../pages/discussion/discussion.page'
// Rxjs
import { take } from 'rxjs/operators';
// Services
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { NotificationService } from 'apps/journal/src/app/services/notification/notification.service';
// Pages
import { ChooseAchieverModalPage } from 'apps/journal/src/app/pages/notifications/modals/choose-achiever-modal/choose-achiever-modal.page';
import { NotificationOptionsPage } from './popovers/notification-options/notification-options.page';
// Interfaces
import { 
  enumNotificationType,
  enumRequestStatus,
  INotificationGoalRequest,
  INotificationWithPostAndSupports,
  enumSupportDecision,
  INotificationSupport, 
  IGoalStakeholder } from '@strive/interfaces';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  @Input() goalId: string
  @Input() notification: any // actually type INotification
  @Input() isAdmin: boolean
  @Input() reference: string

  sourcePageRef: string
  isFromPerson: boolean

  enumNotificationType = enumNotificationType
  enumSupportDecision = enumSupportDecision
  enumRequestStatus = enumRequestStatus

  constructor(
    private user: UserService,
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private _popoverCtrl: PopoverController
  ) { }

  ngOnInit() {

    // determine source page reference
    if (this.notification.source.userId) {
      this.sourcePageRef = `/profile/${this.notification.source.userId}`
      this.isFromPerson = true
    } else if (this.notification.source.collectiveGoalId) {
      this.sourcePageRef = `/collective-goal/${this.notification.source.collectiveGoalId}`
    } else if (this.notification.source.goalId) {
      this.sourcePageRef = `/goal/${this.notification.source.goalId}`
    } else {
      this.sourcePageRef = ''
    }
  }

  async openNotificationOptions(event): Promise<void> {

    const popover = await this._popoverCtrl.create({
      component: NotificationOptionsPage,
      event: event,
      componentProps: {
        isAdmin: this.isAdmin,
        reference: this.reference
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      if (data.data.remove) {
        this.notification = undefined
      }
    })

  }

  async openDiscussion(): Promise<void> {

    const modal = await this.modalCtrl.create({
      component: DiscussionPage,
      componentProps: {
        discussionId: this.notification.discussionId,
      }
    })
    await modal.present()

  }

  public async handleRequestDecision(notification: INotificationGoalRequest, isAccepted: boolean): Promise<void> {

    if (isAccepted) {

      await this.goalStakeholderService.upsert(notification.requestPath.uidRequestor, notification.requestPath.goalId, {
        isAchiever: true,
        hasOpenRequestToJoin: false
      })

      await this.notificationService.upsert(this.user.uid, notification.id, {
        requestStatus: enumRequestStatus.accepted
      })

      notification.requestStatus = enumRequestStatus.accepted

    } else {

      await this.goalStakeholderService.upsert(notification.requestPath.uidRequestor, notification.requestPath.goalId, {
        hasOpenRequestToJoin: false
      })

      await this.notificationService.upsert(this.user.uid, notification.id, {
        requestStatus: enumRequestStatus.rejected
      })

      notification.requestStatus = enumRequestStatus.rejected

    }

  }

  public async chooseReceiver(notification: INotificationWithPostAndSupports, support: INotificationSupport): Promise<void> {

    if (notification.notificationType === enumNotificationType.evidence_finalized) return

    const stakeholders: IGoalStakeholder[] = await this.db.colWithIds$<IGoalStakeholder[]>(`Goals/${notification.path.goalId}/GStakeholders`, ref => ref.where('isAchiever', '==', true)).pipe(take(1)).toPromise()

    const chooseAchieverModal = await this.modalCtrl.create({
      component: ChooseAchieverModalPage,
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

  public async finalizeDecision(notification: INotificationWithPostAndSupports): Promise<void> {

    await this.notificationService.finalizeDecision(notification)
    notification.notificationType = enumNotificationType.evidence_finalized

  }

  public async removeReceiver(notification: INotificationWithPostAndSupports, support: INotificationSupport): Promise<void> {

    if (notification.notificationType === enumNotificationType.evidence_finalized) return

    support.receiverId = null
    support.receiverUsername = null
    support.receiverPhotoURL = null

  }

}
