import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
// Pages
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { AddSupportModalPage } from '../../../modals/add-support-modal/add-support-modal.page';
import { MilestoneOptionsPage } from './popovers/milestone-options/milestone-options.page';
// Services
import { PostService } from '@strive/post/+state/post.service';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
// Interfaces
import { Milestone, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'
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
  public _isGoal: boolean = false
  // For both
  @Input() milestone: Milestone
  @Input() isAdmin: boolean

  public enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private alertCtrl: AlertController,
    private imageService: ImageService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private _popoverCtrl: PopoverController,
    private postService: PostService,
  ) { }

  async ngOnInit() {
    if (this.goalId) this._isGoal = true
  }

  public async openMilestoneOptions(event): Promise<void> {

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

    if (this.milestone.status !== enumMilestoneStatus.pending) return

    $event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    const supportModal = await this.modalCtrl.create({
      component: AddSupportModalPage,
      componentProps: {
        goalId: this.goalId,
        milestone: this.milestone
      }
    })
    await supportModal.present()

  }

  public async milestoneStatusChange(): Promise<void> {

    if (!this.isAdmin && !this.isAchiever) return

    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    let alert = await this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: async () => {

            this.milestoneService.upsert(this.goalId, this.milestone.id, { status: enumMilestoneStatus.succeeded })
            // Firebase backend function handles completing submilestones (WITHOUT NOTIFICATION)
            // Firebase backend function milestoneChangeHandler handles sending notification to supporters of milestone

            this.milestone.status = enumMilestoneStatus.succeeded
            this.startPostCreation()
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: async () => {

            this.milestoneService.milestoneStatusChange(this.goalId, this.milestone, enumMilestoneStatus.failed)
            this.milestone.status = enumMilestoneStatus.failed
            this.startPostCreation()

          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    })
    await alert.present()

  }

  private async startPostCreation() {

    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        milestone: this.milestone,
        goal: this.goal,
        isEvidence: true
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(data => {
      // refresh page
      // reset imageservice
    })

  }

  public async _openingDatetime($event): Promise<void> {

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

  public async onDeadlineDateChange(value): Promise<void> {

    this.milestone.deadline = value
    this.milestoneService.upsert(this.goalId, this.milestone.id, {
      deadline: value ? value : null
    })

  }

}
