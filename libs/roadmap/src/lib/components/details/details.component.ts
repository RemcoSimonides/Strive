import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { FormArray, ReactiveFormsModule } from '@angular/forms'

import { AlertController, IonButton, IonIcon, IonContent, IonItem, IonTextarea, IonList, IonReorderGroup, IonInput, IonReorder, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { checkmarkOutline, alarmOutline, personOutline, reorderFourOutline, trashOutline, checkmarkCircle, radioButtonOff } from 'ionicons/icons'

import { orderBy, serverTimestamp, where } from '@angular/fire/firestore'
import { joinWith } from '@strive/utils/firebase'

import { combineLatest, Observable, of, Subscription } from 'rxjs'
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators'
import { addYears, endOfYear } from 'date-fns'

import { Goal, createSubtask, Milestone, Support, StoryItem, createUser, createGoalStakeholder, createPost, MilestoneStatus, groupByObjective, SupportsGroupedByGoal, sortGroupedSupports } from '@strive/model'

import { MilestoneService } from '@strive/roadmap/milestone.service'
import { MilestoneForm, SubtaskForm } from '@strive/roadmap/forms/milestone.form'
import { StoryService } from '@strive/story/story.service'
import { PostService } from '@strive/post/post.service'
import { ProfileService } from '@strive/user/profile.service'
import { AuthService } from '@strive/auth/auth.service'
import { SupportService } from '@strive/support/support.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { MilestoneStatusComponent } from '../status/status.component'
import { AssigneeComponent } from '../assignee/assignee.component'
import { SubtasksCompletedPipe } from '@strive/roadmap/pipes/subtask.pipe'
import { StoryComponent } from '@strive/story/components/story/story.component'
import { AddSupportComponent } from '@strive/support/components/add/add.component'
import { SupportListComponent } from '@strive/support/components/list/list.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

type MilestoneWithSupport = Milestone & { supports?: Support[] }

@Component({
    selector: '[goal][milestone][stakeholder] strive-milestone-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MilestoneStatusComponent,
        AssigneeComponent,
        SubtasksCompletedPipe,
        StoryComponent,
        AddSupportComponent,
        SupportListComponent,
        HeaderModalComponent,
        IonButton,
        IonIcon,
        IonContent,
        IonItem,
        IonTextarea,
        IonList,
        IonReorderGroup,
        IonInput,
        IonReorder
    ]
})
export class DetailsComponent extends ModalDirective implements OnInit, OnDestroy {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private milestoneService = inject(MilestoneService);
  private popoverCtrl = inject(PopoverController);
  private postService = inject(PostService);
  private profileService = inject(ProfileService);
  private screensize = inject(ScreensizeService);
  private storyService = inject(StoryService);
  private supportService = inject(SupportService);

  private subs: Subscription[] = []

  form!: MilestoneForm
  subtaskForm = new SubtaskForm()

  showDescription = false

  story$?: Observable<StoryItem[]>
  supports$?: Observable<SupportsGroupedByGoal[]>

  isDesktop$ = this.screensize.isDesktop$
  isLoggedIn = this.auth.isLoggedIn

  @Input() goal!: Goal
  @Input() milestone!: MilestoneWithSupport
  @Input() stakeholder = createGoalStakeholder()

  get canEdit(): boolean {
      if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return false
      if (!this.goal.id) return false
      return true
  }

  constructor() {
    super()

    addIcons({ checkmarkOutline, alarmOutline, personOutline, reorderFourOutline, trashOutline, checkmarkCircle, radioButtonOff })
  }

  ngOnInit() {
    this.form = new MilestoneForm(this.milestone)

    const query = [
      where('milestoneId', '==', this.milestone.id),
      orderBy('date', 'desc')
    ]
    this.story$ = this.storyService.collectionData(query, { goalId: this.goal.id }).pipe(
      joinWith({
        user: ({ userId }) => userId ? this.profileService.docData(userId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.docData(milestoneId, { goalId }) : of(undefined),
        post: ({ postId, goalId }) => postId ? this.postService.docData(postId, { goalId }) : of(undefined)
      })
    )

    this.supports$ = this.auth.profile$.pipe(
      switchMap(profile => {
        if (!profile) return []
        return combineLatest([
          this.supportService.collectionData([where('supporterId', '==', profile.uid), where('milestoneId', '==', this.milestone.id)], { goalId: this.goal.id }),
          this.supportService.collectionData([where('recipientId', '==', profile.uid), where('milestoneId', '==', this.milestone.id)], { goalId: this.goal.id })
        ])
      }),
      map(([supporter, recipient]) => [...supporter, ...recipient]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: () => this.goal,
        milestone: () => this.milestone,
        recipient: ({ recipientId }) => this.profileService.docData(recipientId),
        supporter: ({ supporterId }) => this.profileService.docData(supporterId)
      }, { shouldAwait: true }),
      map(groupByObjective),
      map(sortGroupedSupports)
    )

    if (this.canEdit) {
      const sub = this.form.content.valueChanges.pipe(
        filter(_ => this.form.content.valid),
        tap(() => this.form.markAsTouched()),
        debounceTime(500)
      ).subscribe(content => {
        if (!content || !this.canEdit) return

        this.milestoneService.update({ content, id: this.milestone.id }, { goalId: this.goal.id })
        this.form.content.markAsPristine()
        this.cdr.markForCheck()
      })

      const descriptionSub = this.form.description.valueChanges.pipe(
        filter(() => this.form.content.valid),
        tap(() => this.form.markAsTouched()),
        debounceTime(500)
      ).subscribe(description => {
        if (!this.canEdit || !this.form) return
        this.milestoneService.update({ description, id: this.milestone.id }, { goalId: this.goal.id })
        this.milestone.description = description
        this.form.description.markAsPristine()
        this.cdr.markForCheck()
      })

      const subtaskSub = this.form.subtasks.valueChanges.pipe(
        filter(() => this.form.content.valid),
        tap(() => this.form.markAsTouched()),
        debounceTime(500)
      ).subscribe(value => {
        if (!this.canEdit || !this.form) return
        if (this.form.subtasks.valid) {
          const subtasks = value.map(createSubtask)
          this.milestoneService.update({ subtasks, id: this.milestone.id }, { goalId: this.goal.id })
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
            id: this.milestone.id,
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
      }, { goalId: this.goal.id })
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

    const header = this.milestone.supports?.length ? `Milestone has active supports` : ''

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
        this.milestoneService.update(this.milestone.id, { deletedAt: serverTimestamp() as any }, { goalId: this.goal.id })
        this.dismiss()
      }
    })
    alert.present()
  }

  toggleAssignMe() {
    if (!this.canEdit) return
    const uid = this.auth.uid()
    if (!uid) return

    const achieverId = this.milestone.achieverId ? '' : uid
    this.milestone.achieverId = achieverId
    this.milestone.achiever = achieverId ? this.auth.profile() : createUser()

    this.milestoneService.upsert({
      id: this.milestone.id,
      achieverId
    }, { goalId: this.goal.id })
  }

  async openDatepicker() {
    if (!this.canEdit) return
    if (this.milestone.status === 'failed' || this.milestone.status === 'succeeded') return

    const minDate = new Date()
    const maxDate = endOfYear(addYears(new Date(), 1000))
    const value = this.milestone.deadline

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate, value },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if ((role === 'backdrop' || role === 'dismiss') && !data) return

      if (role === 'remove') {
        this.milestone.deadline = undefined
        this.milestoneService.update({
          deadline: null,
          id: this.milestone.id
        }, { goalId: this.goal.id })
      } else {
        this.milestone.deadline = new Date(data)
        this.milestoneService.update({
          deadline: new Date(data),
          id: this.milestone.id
        }, { goalId: this.goal.id })
      }

      this.cdr.markForCheck()
    })
    popover.present()
  }

  addSubtask() {
    if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return
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

    const subtasks = this.form.subtasks.value.map(createSubtask)
    const element = subtasks[from]
    subtasks.splice(from, 1)
    subtasks.splice(to, 0, element)

    this.form.subtasks.setValue(subtasks)

    ev.detail.complete()
  }
}
