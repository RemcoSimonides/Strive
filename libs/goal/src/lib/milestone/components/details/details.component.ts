import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { AlertController, ModalController } from '@ionic/angular'
import { FormArray } from '@angular/forms'

import { Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'

import { Goal, createSubtask, Milestone, createUserLink, Support } from '@strive/model'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { MilestoneForm, SubtaskForm } from '@strive/goal/milestone/forms/milestone.form'
import { UserService } from '@strive/user/user/user.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { delay } from '@strive/utils/helpers'

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

  @Input() goal!: Goal
  @Input() milestone!: Milestone & { supports?: Support[] }
  @Input() isAdmin!: boolean
  @Input() isAchiever!: boolean

  get canEdit(): boolean { return !!this.goal?.id && this.isAdmin }

  constructor(
    private alertCtrl: AlertController,
    protected override location: Location,
    private milestoneService: MilestoneService,
    protected override modalCtrl: ModalController,
    private user: UserService
  ) {
    super (location, modalCtrl)
  }

  ngOnInit() {
    this.form = new MilestoneForm(this.milestone)
    this.form.valueChanges.subscribe(console.log)

    if (this.canEdit) {
      const sub = this.form.content.valueChanges.pipe(
        debounceTime(1000),
        filter(_ => this.form!.content.valid)
      ).subscribe(content => {
        if (!content) return
        if (this.canEdit) {
          this.milestoneService.update({ content, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        }
      })
      const subtaskSub = this.form.subtasks.valueChanges.pipe(
        debounceTime(1000)
      ).subscribe(subtasks => {
        if (this.form!.subtasks.valid) {
          this.milestoneService.update({ subtasks, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        }
      })
      this.subs.push(sub, subtaskSub)
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
    const achiever = this.milestone.achiever.uid ? createUserLink() : createUserLink(this.user.user)
    this.milestone.achiever = achiever
    this.milestoneService.upsert({
      id: this.milestone.id,
      achiever
    }, { params: { goalId: this.goal.id }})
  }

  addSubtask() {
    if (!this.isAdmin || !this.isAchiever) return
    if (this.subtaskForm.valid) {
      const task = createSubtask(this.subtaskForm.value)
      const control = new SubtaskForm(task)
      const subtasksForm = this.form?.subtasks as FormArray
      subtasksForm.push(control)
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
}