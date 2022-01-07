import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';

// Rxjs
import { Observable, of, Subscription } from 'rxjs'
import { map, switchMap } from 'rxjs/operators';

// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

// Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

// Pages
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { UpsertCollectiveGoalComponent } from '@strive/collective-goal/collective-goal/modals/upsert/upsert.component';


@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsComponent implements OnInit {

  goals$: Observable<Goal[]>
  collectiveGoals$: Observable<CollectiveGoal[]>

  backBtnSubscription: Subscription

  constructor(
    public user: UserService,
    private collectiveGoal: CollectiveGoalService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private seo: SeoService
  ) { }

  ngOnInit() {
    this.goals$ = this.user.user$.pipe(
      switchMap(user => user ? this.goal.getStakeholderGoals(user.uid, enumGoalStakeholder.achiever, false) : of([])),
      map(values => values.map(value => value.goal))
    )

    this.collectiveGoals$ = this.user.user$.pipe(
      switchMap(user => user ? this.collectiveGoal.getCollectiveGoalsOfStakeholder(user.uid) : of([]))
    )

    this.seo.generateTags({ title: `Goals - Strive Journal` })
  }

  ionViewDidEnter() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { 
        this.navCtrl.navigateRoot('explore')
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => modal.present())
  }
  
  createCollectiveGoal() {
    this.modalCtrl.create({
      component: UpsertCollectiveGoalComponent
    }).then(modal => modal.present())
  }
}

// function filterDuplicateGoals(observables: Observable<Goal[]>[]) {
//   return combineLatest<Goal[][]>(observables).pipe(
//     map(arr => arr.reduce((acc, cur) => acc.concat(cur))),
//     map(goals => goals.filter((thing, index, self) => 
//       index === self.findIndex((t) => (
//         t.id === thing.id
//       ))
//     ))
//   )
// }