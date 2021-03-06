import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';

// Rxjs
import { Observable, Subscription } from 'rxjs'

// Services
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service'
import { UserService } from '@strive/user/user/+state/user.service';

// Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

// Pages
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';


@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsPage implements OnInit, OnDestroy {

  goals$: Observable<Goal[]>
  collectiveGoals$: Observable<CollectiveGoal[]>

  sub: Subscription
  backBtnSubscription: Subscription

  constructor(
    public user: UserService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private seo: SeoService
  ) { }

  ngOnInit() {
    this.sub = this.user.profile$.subscribe((profile: Profile) => {
      if (!!profile) {
        this.goals$ = this.goalService.getStakeholderGoals(profile.id, enumGoalStakeholder.achiever, false);
        // TODO Create separate section for goals you spectate (they are not YOUR goals)
        // const spectatorGoals = this.goalStakeholderService.getGoals(profile.id, enumGoalStakeholder.spectator, false)
        // this.goals$ = filterDuplicateGoals([achieverGoals, spectatorGoals])

        this.collectiveGoals$ = this.collectiveGoalStakeholderService.getCollectiveGoals(profile.id)
      }
    })

    this.seo.generateTags({ title: `Goals - Strive Journal` })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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