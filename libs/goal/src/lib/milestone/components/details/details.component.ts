import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { Goal } from "@strive/goal/goal/+state/goal.firestore";
import { createSubtask, Milestone } from "@strive/goal/milestone/+state/milestone.firestore";
import { MilestoneService } from "@strive/goal/milestone/+state/milestone.service";
import { MilestoneForm, SubtaskForm } from "@strive/goal/milestone/forms/milestone.form";
import { createUserLink } from "@strive/user/user/+state/user.firestore";
import { UserService } from "@strive/user/user/+state/user.service";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'goal-milestone-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = []

  form: MilestoneForm
  subtaskForm = new SubtaskForm()

  @Input() goal: Goal
  @Input() milestone: Milestone
  @Input() isAdmin: boolean
  @Input() isAchiever: boolean

  get canEdit(): boolean { return this.goal?.id && this.isAdmin }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private alertCtrl: AlertController,
    private location: Location,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    this.form = new MilestoneForm(this.milestone)

    if (this.canEdit) {
      const sub = this.form.content.valueChanges.pipe(
        debounceTime(500),
      ).subscribe(content => {
        if (this.canEdit) {
          this.milestoneService.update({ content, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        }
      })
      const subtaskSub = this.form.subtasks.valueChanges.pipe(
        debounceTime(500)
      ).subscribe(subtasks => {
        if (this.form.subtasks.valid) {
          this.milestoneService.update({ subtasks, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        }
      })
      this.subs.push(sub, subtaskSub)
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  dismiss() {
    this.location.back()
  }

  updateDeadline(deadline: string) {
    if (this.canEdit) {
      this.milestoneService.update({ deadline, id: this.milestone.id }, { params: { goalId: this.goal.id }})
    }
  }

  async deleteMilestone() {
    if (!this.canEdit) return

    const header =  this.milestone.numberOfCustomSupports || this.milestone.numberOfMoneySupports 
      ? `Milestone has active supports` : ''

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
        this.milestoneService.remove(this.milestone.id, { params: { goalId: this.goal.id }})
        this.modalCtrl.dismiss()
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
      const control = new SubtaskForm(this.subtaskForm.value)
      this.form.subtasks.push(control)
      this.subtaskForm.reset(createSubtask())
    }
  }

  toggleSubtask(index: number) {
    const control = this.form.subtasks.at(index).get('completed')
    control.setValue(!control.value)
  }
}