import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
// Pages
import { CreatePostModalPage } from '../../../posts/create-post-modal/create-post-modal.page';
import { AddSupportModalPage } from '../../../modals/add-support-modal/add-support-modal.page';
// Services
import { PostService } from 'apps/journal/src/app/services/post/post.service';
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { MilestoneService } from 'apps/journal/src/app/services/milestone/milestone.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
// Interfaces
import { IMilestone, enumMilestoneStatus } from 'apps/journal/src/app/interfaces/milestone.interface';
import { IPost, enumPostSource } from 'apps/journal/src/app/interfaces/post.interface';
import { IGoal } from 'apps/journal/src/app/interfaces/goal.interface';
import { MilestoneOptionsPage } from './popovers/milestone-options/milestone-options.page';

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
  @Input() goal: IGoal
  @Input() milestoneParent: IMilestone
  public _isGoal: boolean = false
  // For both
  @Input() milestone: IMilestone
  @Input() isAdmin: boolean

  public enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService,
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
    await popover.onDidDismiss().then(async (data) => {
      if (data) {
        if (data.data.setDeadline) {
          this.datePicker.open()
        }

        if (data.data.removeDeadline) {
          this.onDeadlineDateChange(null) 
        }
  
        if (data.data.statusChange) {
          this.milestoneStatusChange()
        }

      }
    })

  }

  public async goToSupportModal(): Promise<void> {

    if (!this.isAdmin || !this.isAchiever) return
    if (this.milestone.status === enumMilestoneStatus.succeeded
    || this.milestone.status === enumMilestoneStatus.failed 
    || this.milestone.status === enumMilestoneStatus.neutral) return

    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

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

            this.milestoneService.milestoneStatusChange(this.goalId, this.milestone, enumMilestoneStatus.succeeded)
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
      component: CreatePostModalPage,
      componentProps: {
        title: this.milestone.description,
        achievedComponent: "Milestone"
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {
      if (data.data) {
        const post = <IPost>{}

        //Prepare post object
        post.content = {
          title: data.data.title,
          description: data.data.description,
          mediaURL: await this.imageService.uploadImage(`Goals/${this.goalId}/Posts/${this.milestone.id}`, false)
        }
        post.milestone = {
          id: this.milestone.id,
          description: this.milestone.description
        }
        post.goal = {
          id: this.goalId,
          title: this.goal.title,
          image: this.goal.image
        }
        post.isEvidence = true

        //Create post
        this.postService.createPost(enumPostSource.milestone, this.goalId, post, this.milestone.id)

      }
      await this.imageService.reset()
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