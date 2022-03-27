import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { where } from '@angular/fire/firestore';

// Strive
import { Notification, SupportDecisionMeta } from '@strive/notification/+state/notification.firestore';
import { NotificationOptionsPopoverComponent } from '@strive/notification/components/notification-options/notification-options.component';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { NotificationSupport } from '@strive/support/+state/support.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { DiscussionModalComponent } from '@strive/discussion/components/discussion-modal/discussion-modal.component';
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { smartJoin } from '@strive/utils/helpers';
import { SupportDecisionComponent } from '@strive/support/modals/decision/decision.component';


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

  async giveSupport(notification: Notification<SupportDecisionMeta>) {
    if (notification.meta.status === 'finalized') return

    if (notification.meta.supports.length === 1) {
      await this.notificationService.finalizeDecision(notification)
      notification.meta.status = 'finalized'
      this.cdr.markForCheck()
    } else {
      this.more(notification)
    }
  }

  async rejectSupport(notification: Notification<SupportDecisionMeta>) {
    if (this.notification.meta.status === 'finalized') return

    notification.meta.supports.forEach(support => {
      support.receiver = createUserLink()
    })
    await this.notificationService.finalizeDecision(notification)
    notification.meta.status= 'finalized'
    this.cdr.markForCheck()
  }

  async more(notification: Notification<SupportDecisionMeta>) {
    if (notification.meta.status === 'finalized') return

    const achievers = await this.goalStakeholderService.getValue(
      [where('isAchiever', '==', true)],
      { goalId: notification.source.goal.id }
    )

    const modal = await this.modalCtrl.create({
      component: SupportDecisionComponent,
      componentProps: { achievers, notification }
    })
    modal.onDidDismiss().then(() => this.cdr.markForCheck())
    modal.present()
  }

  getSupports(supports: NotificationSupport[]) {
    const descriptions = supports.map(support => support.description);
    return smartJoin(descriptions, '", "', '" and "')
  }

}