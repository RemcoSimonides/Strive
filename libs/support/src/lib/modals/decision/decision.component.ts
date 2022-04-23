import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Notification, SupportDecisionMeta } from '@strive/notification/+state/notification.firestore';
import { NotificationSupport } from '@strive/support/+state/support.firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { AchieversPopoverComponent } from './achievers/achievers.component';
import { NotificationService } from '@strive/notification/+state/notification.service';

@Component({
  selector: 'support-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDecisionComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  @Input() achievers: GoalStakeholder[]
  @Input() notification: Notification<SupportDecisionMeta>

  constructor(
    private cdr: ChangeDetectorRef,
    private location: Location,
    private modalCtrl: ModalController,
    private notificationService: NotificationService
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }

  dismiss() {
    this.location.back()
  }

  async chooseReceiver(support: NotificationSupport) {
    if (this.notification.meta.status === 'finalized') return
    if (this.achievers.length === 1) {
      support.receiver = support.receiver?.uid
        ? createUserLink()
        : createUserLink(this.achievers[0])
      this.cdr.markForCheck()
      return
    }

    const result = [] // trick to get result back from modal. For some reason I cant get data back through modal.
    const modal = await this.modalCtrl.create({
      component: AchieversPopoverComponent,
      componentProps: {
        achievers: this.achievers,
        result
      }
    })
    modal.onDidDismiss().then(() => {
      const [achiever] = result
      if (achiever) {
        support.receiver = createUserLink(achiever)
        this.cdr.markForCheck()
      }
    })
    modal.present()
  }

  async finalize() {
    await this.notificationService.finalizeDecision(this.notification)
    this.notification.meta.status = 'finalized'
    this.dismiss()
  }

}