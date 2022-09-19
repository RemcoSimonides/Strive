import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { AlertController, ModalController } from '@ionic/angular'
import { FormArray } from '@angular/forms'

import { Observable, Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'

import { Goal, createSubtask, Milestone, createUserLink, Support, StoryItem, createUser } from '@strive/model'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { MilestoneForm, SubtaskForm } from '@strive/goal/milestone/forms/milestone.form'
import { UserService } from '@strive/user/user/user.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { delay } from '@strive/utils/helpers'
import { StoryService } from '@strive/goal/story/story.service'
import { orderBy, where } from 'firebase/firestore'

@Component({
  selector: '[goal][milestone][isAdmin][isAchiever] goal-milestone-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent extends ModalDirective implements OnInit, OnDestroy {
  private subs: Subscription[] = []

  form?: MilestoneForm
  subtaskForm = new SubtaskForm()

  story$?: Observable<StoryItem[]>

  @Input() goal!: Goal
  @Input() milestone!: Milestone & { supports?: Support[] }
  @Input() isAdmin!: boolean
  @Input() isAchiever!: boolean

  get canEdit(): boolean { return !!this.goal?.id && this.isAdmin }

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    protected override location: Location,
    private milestoneService: MilestoneService,
    protected override modalCtrl: ModalController,
    private storyService: StoryService,
    private user: UserService
  ) {
    super (location, modalCtrl)
  }

  ngOnInit() {
    this.form = new MilestoneForm(this.milestone)

    const query = [
      where('source.milestone.id', '==', this.milestone.id),
      orderBy('date', 'desc')
    ]
    this.story$ = this.storyService.valueChanges(query, { goalId: this.goal.id })

    if (this.canEdit) {
      const sub = this.form.content.valueChanges.pipe(
        debounceTime(2000),
        filter(_ => this.form!.content.valid)
      ).subscribe(content => {
        if (!content || !this.form || !this.canEdit) return
        if (this.canEdit) {
          this.milestoneService.update({ content, id: this.milestone.id }, { params: { goalId: this.goal.id }})
          this.form?.content.markAsPristine()
          this.cdr.markForCheck()
        }
      })

      const descriptionSub = this.form.description.valueChanges.pipe(
        debounceTime(2000),
        filter(_ => this.form!.content.valid)
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
        if (this.form!.subtasks.valid) {
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

  updateDeadline(deadline: string) {
    if (this.canEdit) {
      this.milestoneService.update({ deadline, id: this.milestone.id }, { params: { goalId: this.goal.id }})
    }
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
        this.milestoneService.remove(this.milestone.id, { params: { goalId: this.goal.id }})
        this.dismiss()
      }
    })
    alert.present()
  }

  toggleAssignMe() {
    if (!this.canEdit) return
    if (!this.user.uid) return

    const achieverId = this.milestone.achieverId ? '' : this.user.uid
    this.milestone.achieverId = achieverId
    this.milestone.achiever = achieverId ? this.user.user : createUser()

    this.milestoneService.upsert({
      id: this.milestone.id,
      achieverId
    }, { params: { goalId: this.goal.id }})
  }

  addSubtask() {
    if (!this.isAdmin || !this.isAchiever) return
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

  openSupportModal() {
    this.dismiss()
    delay(250).then(_ => {
      this.modalCtrl.create({
        component: AddSupportModalComponent,
        componentProps: {
          goalId: this.goal.id,
          milestone: this.milestone
        }
      }).then(modal => modal.present())
    })
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
}