import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { AlertController, ItemReorderEventDetail, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { chatboxOutline, listOutline, alarmOutline, trashOutline } from 'ionicons/icons'
import { createGoalStakeholder, createPost, Goal, MilestoneStatus, StoryItem, Support } from '@strive/model'

import { serverTimestamp } from 'firebase/firestore'

import { createMilestone, Milestone } from '@strive/model'
import { MilestoneForm } from '@strive/roadmap/forms/milestone.form'

import { MilestoneService } from '@strive/roadmap/milestone.service'
import { AuthService } from '@strive/auth/auth.service'

import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { DetailsComponent } from '../details/details.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { GoalService } from '@strive/goal/goal.service'

type MilestoneWithSupport = Milestone & { supports?: Support[], story?: StoryItem[] }

@Component({
  selector: '[goal][milestones][stakeholder] strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  @Input() goal!: Goal
  @Input() milestones!: MilestoneWithSupport[]

  @Input() stakeholder = createGoalStakeholder()

  @Input() createMode = false

  @Output() changeStatus = new EventEmitter<Milestone>()

  milestoneForm = new MilestoneForm()

  get canEdit(): boolean {
    return this.stakeholder.isAdmin || this.stakeholder.isAchiever
  }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private milestone: MilestoneService
  ) {
    addIcons({ chatboxOutline, listOutline, alarmOutline, trashOutline })
  }

  trackByFn(index: number, milestone: Milestone) {
    return milestone.id
  }

  updateStatus(milestone: Milestone, event: UIEvent) {
    if (!this.canEdit) return
    if (milestone.status === 'failed' || milestone.status === 'succeeded') return

    event.stopPropagation()

    const openPostModal = () => {
      this.modalCtrl.create({
        component: UpsertPostModalComponent,
        componentProps: {
          post: createPost({
            id: milestone.id,
            goalId: this.goal.id,
            milestoneId: milestone.id
          })
        }
      }).then(modal => modal.present())
    }

    const getHandler = (status: MilestoneStatus) => {
      return () => {
        this.milestone.upsert({
          id: milestone.id,
          status,
          finishedAt: serverTimestamp() as any
        }, { params: { goalId: this.goal.id } })
        milestone.status = status
        this.cdr.markForCheck()

        if (this.goal.status === 'pending' && this.milestones.every(milestone => milestone.status !== 'pending')) {

          if (status === 'failed') {
            this.alertCtrl.create({
              subHeader: 'All milestones are finished.',
              message: 'Do you want to mark the goal as failed or succeeded?',
              buttons: [
                {
                  text: 'Succeeded',
                  handler: () => {
                    this.goalService.update(this.goal.id, { status: 'succeeded' })
                    openPostModal()
                  }
                },
                {
                  text: 'Failed',
                  handler: () => {
                    this.goalService.update(this.goal.id, { status: 'failed' })
                    openPostModal()
                  }
                },
                {
                  text: 'None',
                  handler: openPostModal
                }
              ]
            }).then(alert => alert.present())

          } else if (status === 'succeeded') {
            this.alertCtrl.create({
              subHeader: 'Congratulations! All milestones are finished.',
              message: 'Do you want to mark the goal as finished?',
              buttons: [
                {
                  text: 'Yes',
                  handler: () => {
                    this.goalService.update(this.goal.id, { status: 'succeeded' })
                    openPostModal()
                  }
                },
                {
                  text: 'No',
                  handler: openPostModal
                }
              ]
            }).then(alert => alert.present())
          }
        } else {
          openPostModal()
        }
      }
    }

    this.alertCtrl.create({
      subHeader: 'Good job!',
      message: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: getHandler('succeeded')
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: getHandler('failed')
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    }).then(alert => alert.present())
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const { from, to } = ev.detail

    const element = this.milestones[from]
    this.milestones.splice(from, 1)
    this.milestones.splice(to, 0, element)

    this.milestones.forEach(((milestone, index) => { milestone.order = index }))

    const min = Math.min(from, to)
    const max = Math.max(from, to)
    const milestonesToUpdate = this.milestones.filter(milestone => milestone.order >= min && milestone.order <= max).map(milestone => ({ id: milestone.id, order: milestone.order }))

    this.milestone.update(milestonesToUpdate, { params: { goalId: this.goal.id } })
    ev.detail.complete()
  }

  add() {
    if (this.milestoneForm.content.value) {
      this.milestoneForm.order.setValue(this.milestones.length)
      const milestone = createMilestone({
        ...this.milestoneForm.getRawValue(),
        status: this.goal.status !== 'pending' && this.createMode ? 'succeeded' : 'pending'
      })
      this.milestone.add(milestone, { params: { goalId: this.goal.id } })
      this.milestoneForm.reset(createMilestone())
    }
  }

  openDetails(milestone: Milestone) {
    this.modalCtrl.create({
      component: DetailsComponent,
      componentProps: {
        goal: this.goal,
        stakeholder: this.stakeholder,
        milestone
      },
      cssClass: 'high-modal'
    }).then(modal => modal.present())
  }

  async deleteMilestone(milestone: MilestoneWithSupport) {
    if (!this.canEdit) return

    const header = milestone.supports?.length ? `Milestone has active supports` : ''

    const alert = await this.alertCtrl.create({
      header,
      subHeader: `Are you sure you want to delete this milestone?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'delete'
        }
      ]
    })
    alert.onDidDismiss().then((res) => {
      if (res.role == 'delete') {
        if (!milestone.id) return
        this.milestone.update(milestone.id, { deletedAt: serverTimestamp() }, { params: { goalId: this.goal.id } })
      }
    })
    alert.present()
  }

  async openSupportModal(event: Event, milestone: Milestone) {
    if (milestone.status !== 'pending') return
    event.stopPropagation()

    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.openSupportModal(event, milestone)
      })
      return modal.present()
    }

    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goal: this.goal,
        milestone
      }
    }).then(modal => modal.present())
  }
}
