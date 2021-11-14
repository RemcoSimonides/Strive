import { ChangeDetectionStrategy, Component, HostListener, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController, ModalController, NavParams } from "@ionic/angular";
import { createGoalStakeholder, GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { GoalStakeholderService } from "@strive/goal/stakeholder/+state/stakeholder.service";
import { UserService } from "@strive/user/user/+state/user.service";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: 'goal-team-modal',
  templateUrl: './team.modal.html',
  styleUrls: ['./team.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamModal implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    // would be nice to prevent the navigation too
    this.modalCtrl.dismiss()
  }
  goalId: string

  stakeholders$: Observable<GoalStakeholder[]>
  isAdmin$: Observable<boolean>
  isAchiever$: Observable<boolean>
  hasOpenRequestToJoin$: Observable<boolean>

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    private user: UserService
  ) { }

  ngOnInit() {
    this.goalId = this.navParams.data.goalId as string

    if (!this.goalId) return
    this.stakeholders$ = this.stakeholder.valueChanges({ goalId: this.goalId })
    const stakeholder$ = this.user.profile$.pipe(
      switchMap(profile => profile
        ? this.stakeholder.valueChanges(this.user.uid, { goalId: this.goalId })
        : of(createGoalStakeholder())
      )
    )
    this.isAdmin$ = stakeholder$.pipe(map(stakeholder => stakeholder.isAdmin))
    this.isAchiever$ = stakeholder$.pipe(map(stakeholder => stakeholder.isAchiever))
    this.hasOpenRequestToJoin$ = stakeholder$.pipe(map(stakeholder => stakeholder.hasOpenRequestToJoin))
  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

  navTo(uid: string) {
    this.router.navigate(['/profile/', uid])
    this.dismiss()
  }

  toggleAdmin(stakeholder: GoalStakeholder, event: Event) {
    event.stopPropagation()
    this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.stakeholder.upsert({
              uid: stakeholder.uid,
              isAdmin: !stakeholder.isAdmin
            }, { params: { goalId: this.goalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  toggleAchiever(stakeholder: GoalStakeholder, event: Event) {
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAchiever: !stakeholder.isAchiever
    }, { params: { goalId: this.goalId }})
  }

  toggleSupporter(stakeholder: GoalStakeholder, event: Event) {
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isSupporter: !stakeholder.isSupporter
    }, { params: { goalId: this.goalId }})
  }
}