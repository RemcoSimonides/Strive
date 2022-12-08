import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { AlertController, ModalController, Platform, PopoverController } from '@ionic/angular'
import { FormArray } from '@angular/forms'

import { orderBy, serverTimestamp, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { Observable, of, Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'
import { addYears, endOfYear } from 'date-fns'

import { Goal, createSubtask, Milestone, Support, StoryItem, createUser, createGoalStakeholder, createPost, MilestoneStatus } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { MilestoneForm, SubtaskForm } from '@strive/goal/milestone/forms/milestone.form'
import { StoryService } from '@strive/goal/story/story.service'
import { PostService } from '@strive/post/post.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component'

type MilestoneWithSupport = Milestone & { supports?: Support[] }

@Component({
  selector: '[goal][milestone][stakeholder] goal-milestone-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent extends ModalDirective implements OnInit, OnDestroy {
  private subs: Subscription[] = []

  form!: MilestoneForm
  subtaskForm = new SubtaskForm()

  showDescription = false

  story$?: Observable<StoryItem[]>

  @Input() goal!: Goal
  @Input() milestone!: MilestoneWithSupport
  @Input() stakeholder = createGoalStakeholder()

  get canEdit(): boolean {
    if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return false
    if (!this.goal.id) return false
    return true
  }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    protected override location: Location,
    private milestoneService: MilestoneService,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private popoverCtrl: PopoverController,
    private postService: PostService,
    private profileService: ProfileService,
    private storyService: StoryService
  ) {
    super (location, modalCtrl, platform)
  }

  ngOnInit() {
    this.form = new MilestoneForm(this.milestone)

    const query = [
      where('milestoneId', '==', this.milestone.id),
      orderBy('date', 'desc')
    ]
    this.story$ = this.storyService.valueChanges(query, { goalId: this.goal.id }).pipe(
      joinWith({
        user: ({ userId }) => userId ? this.profileService.valueChanges(userId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        post: ({ postId, goalId }) => postId ? this.postService.valueChanges(postId, { goalId }) : of(undefined)
      })
    )

    if (this.canEdit) {
      const sub = this.form.content.valueChanges.pipe(
        debounceTime(2000),
        filter(_ => this.form.content.valid)
      ).subscribe(content => {
        if (!content || !this.form || !this.canEdit) return
        this.milestoneService.update({ content, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        this.form?.content.markAsPristine()
        this.cdr.markForCheck()
      })

      const descriptionSub = this.form.description.valueChanges.pipe(
        debounceTime(2000),
        filter(_ => this.form.content.valid)
      ).subscribe(description => {
        if (!this.canEdit || !this.form) return
        this.milestoneService.update({ description, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        this.milestone.description = description
        this.form.description.markAsPristine()
        this.cdr.markForCheck()
      })

      const subtaskSub = this.form.subtasks.valueChanges.pipe(
        debounceTime(2000)
      ).subscribe(subtasks => {
        if (!this.canEdit || !this.form) return
        if (this.form.subtasks.valid) {
          this.milestoneService.update({ subtasks, id: this.milestone.id }, { params: { goalId: this.goal.id }})
          this.form?.subtasks.markAsPristine()
          this.cdr.markForCheck()
        }
      })
      this.subs.push(sub, descriptionSub, subtaskSub)
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  updateStatus() {
    if (!this.canEdit) return
    if (this.milestone.status === 'failed' || this.milestone.status === 'succeeded') return

    const openPostModal = () => {
      this.modalCtrl.create({
        component: UpsertPostModalComponent,
        componentProps: {
          post: createPost({
            goalId: this.goal.id,
            milestoneId: this.milestone.id
          })
        }
      }).then(modal => modal.present())
    }

    const getHandler = (status: MilestoneStatus) => {
      return () => {
        this.milestoneService.upsert({
          id: this.milestone.id,
          status,
          finishedAt: serverTimestamp() as any
        }, { params: { goalId: this.goal.id }})
        this.milestone.status = status
        this.cdr.markForCheck()
        openPostModal()
      }
    }

    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
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

  async deleteMilestone() {
    if (!this.canEdit) return

    const header =  this.milestone.supports?.length ? `Milestone has active supports` : ''

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
        if (!this.milestone?.id) return
        this.milestoneService.update(this.milestone.id, { deletedAt: serverTimestamp() }, { params: { goalId: this.goal.id }})
        this.dismiss()
      }
    })
    alert.present()
  }

  toggleAssignMe() {
    if (!this.canEdit) return
    if (!this.auth.uid) return

    const achieverId = this.milestone.achieverId ? '' : this.auth.uid
    this.milestone.achieverId = achieverId
    this.milestone.achiever = achieverId ? this.auth.profile : createUser()

    this.milestoneService.upsert({
      id: this.milestone.id,
      achieverId
    }, { params: { goalId: this.goal.id }})
  }

  async openDatepicker() {
    if (!this.canEdit) return    
    if (this.milestone.status === 'failed' || this.milestone.status === 'succeeded') return
  
    const minDate = new Date()
    const maxDate = endOfYear(addYears(new Date(), 1000))

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      const deadline = role === 'remove' ? '' : data ?? ''

      this.milestone.deadline = deadline
      this.milestoneService.update({ deadline, id: this.milestone.id }, { params: { goalId: this.goal.id }})  
      this.cdr.markForCheck()
    })
    popover.present()
  }

  addSubtask() {
    if (!this.stakeholder.isAdmin || !this.stakeholder.isAchiever) return
    if (this.subtaskForm.valid) {
      const task = createSubtask(this.subtaskForm.value)
      const control = new SubtaskForm(task)
      const subtasksForm = this.form?.subtasks as FormArray
      subtasksForm.push(control)
      this.form?.subtasks.markAsDirty()
      this.subtaskForm.reset(createSubtask())
    }
  }

  toggleSubtask(index: number) {
    const subtasksForm = this.form?.subtasks as FormArray
    const control = subtasksForm.at(index).get('completed')
    control?.setValue(!control.value)
  }

  subtaskBlur(index: number) {
    const subtasksForm = this.form?.subtasks as FormArray
    const control = subtasksForm.at(index).get('content')
    if (!control?.value) subtasksForm.removeAt(index)
  }

  doReorder(ev: any) {
    if (!this.form) return
    const { from, to } = ev.detail

    const subtasks = this.form.subtasks.value
    const element = subtasks[from]
    subtasks.splice(from, 1)
    subtasks.splice(to, 0, element)

    this.form.subtasks.setValue(subtasks)

    ev.detail.complete()
  }

  openSupportModal() {
    this.dismiss()
    delay(250).then(() => {
      this.modalCtrl.create({
        component: AddSupportModalComponent,
        componentProps: {
          goalId: this.goal.id,
          milestone: this.milestone
        }
      }).then(modal => modal.present())
    })
  }
}