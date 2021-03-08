import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
// Pages
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { AddSupportModalPage } from '../../../modals/add-support-modal/add-support-modal.page';
import { MilestoneOptionsPage } from './popovers/milestone-options/milestone-options.page';
// Services
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { ImageService } from '@strive/media/+state/image.service';
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

@Component({
  selector: 'app-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss'],
})
export class MilestoneComponent implements OnInit {
  @ViewChild('datePicker') datePicker;

  // For goal
  @Input() goalId: string
  @Input() isAchiever: boolean
  @Input() goal: Goal
  @Input() milestoneParent: Milestone
  public isGoal = false
  // For both
  @Input() milestone: Milestone
  @Input() isAdmin: boolean

  constructor(
    private alertCtrl: AlertController,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private _popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    if (!!this.goalId) this.isGoal = true
  }

  public async openMilestoneOptions(event: Event): Promise<void> {

    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    const popover = await this._popoverCtrl.create({
      component: MilestoneOptionsPage,
      event: event,
      componentProps: {
        goalId: this.goalId,
        milestone: this.milestone
      }
    })
    await popover.present()
    await popover.onDidDismiss().then(data => {
      if (!!data.data) {

        if (!!data.data.setDeadline) {
          this.datePicker.open()
        }

        if (!!data.data.removeDeadline) {
          this.onDeadlineDateChange(null) 
        }
  
        if (!!data.data.statusChange) {
          this.milestoneStatusChange()
        }
      }
    })
  }

  public async goToSupportModal($event: Event): Promise<void> {

    if (this.milestone.status !== 'pending') return

    $event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    this.modalCtrl.create({
      component: AddSupportModalPage,
      componentProps: {
        goalId: this.goalId,
        milestone: this.milestone
      }
    }).then(modal => modal.present())
  }

  public milestoneStatusChange(event?: Event) {

    if (!this.isAdmin && !this.isAchiever) return

    if (event) event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert(this.goalId, this.milestone.id, { status: 'succeeded' })
            this.milestone.status = 'succeeded'
            this.startPostCreation()
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert(this.goalId, this.milestone.id, { status: 'failed' })
            this.milestone.status = 'failed'
            this.startPostCreation()
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    }).then(alert => alert.present())
  }

  private async startPostCreation() {

    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        milestone: this.milestone,
        goal: this.goal,
        postId: this.milestone.id
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(data => {
      // refresh page
      // reset imageservice
    })

  }

  public async openDatetime($event): Promise<void> {

    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    if (this.milestoneParent) {
      $event.target.max = this.milestoneParent.deadline
    } else if (this.goal.deadline) {
      $event.target.max = this.goal.deadline
    } else {
      $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    }

  }

  public onDeadlineDateChange(value) {
    this.milestone.deadline = value
    this.milestoneService.upsert(this.goalId, this.milestone.id, {
      deadline: value ? value : null
    })
  }
}
