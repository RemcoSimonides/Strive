import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { AlertController, ModalController, NavParams } from "@ionic/angular";
import { createGoalStakeholder, GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { GoalStakeholderService } from "@strive/goal/stakeholder/+state/stakeholder.service";
import { UserService } from "@strive/user/user/+state/user.service";
import { combineLatest, Observable, of } from "rxjs";
import { map, startWith, switchMap } from "rxjs/operators";
import { FormControl } from "@angular/forms";
import { delay } from "@strive/utils/helpers";
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'goal-team-modal',
  templateUrl: './team.modal.html',
  styleUrls: ['./team.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamModalComponent extends ModalDirective implements OnInit {
  goalId: string

  stakeholders$: Observable<GoalStakeholder[]>
  isAdmin$: Observable<boolean>
  isAchiever$: Observable<boolean>
  hasOpenRequestToJoin$: Observable<boolean>

  filter = new FormControl()
  
  constructor(
    private alertCtrl: AlertController,
    protected modalCtrl: ModalController,
    private navParams: NavParams,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    private user: UserService,
    protected location: Location
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.goalId = this.navParams.data.goalId as string
    if (!this.goalId) return

    this.stakeholders$ = this.stakeholder.valueChanges({ goalId: this.goalId })

    this.stakeholders$ = combineLatest([
      this.filter.valueChanges.pipe(startWith(this.filter.value)),
      this.stakeholder.valueChanges({ goalId: this.goalId })
    ]).pipe(
      map(([ filter, stakeholders ]) => filter
        ? stakeholders.filter(stakeholder => stakeholder[filter])
        : stakeholders
    ))

    const stakeholder$ = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholder.valueChanges(user.uid, { goalId: this.goalId }) : of()),
      map(stakeholder =>  createGoalStakeholder(stakeholder))
    )
    this.isAdmin$ = stakeholder$.pipe(map(stakeholder => stakeholder.isAdmin))
    this.isAchiever$ = stakeholder$.pipe(map(stakeholder => stakeholder.isAchiever))
    this.hasOpenRequestToJoin$ = stakeholder$.pipe(map(stakeholder => stakeholder.hasOpenRequestToJoin))    
  }

  navTo(uid: string) {
    this.location.back()
    delay(250).then(_ => {
      this.router.navigate(['/profile/', uid])
    })
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