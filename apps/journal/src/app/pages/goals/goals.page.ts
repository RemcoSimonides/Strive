import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';

// Rxjs
import { Observable, combineLatest, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

// Services
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';

// Interfaces
import { 
  IGoal,
  enumGoalPublicity,
  enumGoalStakeholder
} from '@strive/interfaces';
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

// Pages
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { Profile } from '@strive/user/user/+state/user.firestore';


@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsPage implements OnInit, OnDestroy {

  enumGoalPublicity = enumGoalPublicity;

  goalsColObs: Observable<IGoal[]>;
  collectiveGoalsColObs: Observable<ICollectiveGoal[]>;

  sub: Subscription;
  backBtnSubscription: Subscription;

  constructor(
    public user: UserService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private goalStakeholderService: GoalStakeholderService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private _seo: SeoService
  ) { }

  async ngOnInit() { 
    
    this.sub = this.user.profile$.subscribe(async (profile: Profile) => {
      if (!!profile) {
        const achieverGoals = this.goalStakeholderService.getGoals(profile.id, enumGoalStakeholder.achiever, false)
        const spectatorGoals = this.goalStakeholderService.getGoals(profile.id, enumGoalStakeholder.spectator, false)
        this.goalsColObs = filterDuplicateGoals([achieverGoals, spectatorGoals])

        this.collectiveGoalsColObs = this.collectiveGoalStakeholderService.getCollectiveGoals(profile.id)
      }
    })

    this._seo.generateTags({ title: `Goals - Strive Journal` })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ionViewDidEnter() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this.backBtnSubscription = this._platform.backButton.subscribe(() => { 
        this.navCtrl.navigateRoot('explore')
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  async openAuthModal(): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }
}

function filterDuplicateGoals(observables: Observable<IGoal[]>[]) {
  return combineLatest<IGoal[][]>(observables).pipe(
    map(arr => arr.reduce((acc, cur) => acc.concat(cur))),
    map(goals => goals.filter((thing, index, self) => 
      index === self.findIndex((t) => (
        t.id === thing.id
      ))
    ))
  )
}