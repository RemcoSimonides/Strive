import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { Goal } from "@strive/goal/goal/+state/goal.firestore";
import { Milestone } from "@strive/goal/milestone/+state/milestone.firestore";
import { MilestoneService } from "@strive/goal/milestone/+state/milestone.service";
import { MilestoneForm } from "@strive/goal/milestone/forms/milestone.form";
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
  private sub: Subscription

  form: MilestoneForm

  @Input() goal: Goal
  @Input() milestone: Milestone
  @Input() isAdmin: boolean
  @Input() isAchiever: boolean

  get canEdit(): boolean { return this.goal?.id && this.isAdmin }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  constructor(
    private alertCtrl: AlertController,
    private location: Location,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() {
    this.form = new MilestoneForm(this.milestone)

    if (this.canEdit) {
      this.sub = this.form.get('content').valueChanges.pipe(
        debounceTime(500),
      ).subscribe(content => {
        if (this.canEdit) {
          this.milestoneService.update({ content, id: this.milestone.id }, { params: { goalId: this.goal.id }})
        }
      })
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
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
}