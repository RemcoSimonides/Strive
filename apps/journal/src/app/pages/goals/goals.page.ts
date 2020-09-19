import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';

// Rxjs
import { Observable, combineLatest } from 'rxjs'
import { map, take } from 'rxjs/operators'

// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { CollectiveGoalStakeholderService } from 'apps/journal/src/app/services/collective-goal/collective-goal-stakeholder.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';

// Interfaces
import { 
  IUser,
  IGoal,
  enumGoalPublicity,
  ICollectiveGoal,
  enumGoalStakeholder
} from '@strive/interfaces';

// Pages
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';

// Other
import { goalSlideOptions } from '../../../theme/goal-slide-options';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsPage implements OnInit {

  _backBtnSubscription
  _isLoggedIn: boolean;

  enumGoalPublicity = enumGoalPublicity
  public _goalSlideOptions = goalSlideOptions

  userDocObs: Observable<IUser>

  goalsColObs: Observable<IGoal[]>
  _goals: IGoal[]
  _finishedGoals: IGoal[]
  collectiveGoalsColObs: Observable<ICollectiveGoal[]>

  constructor(
    public authService: AuthService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private goalStakeholderService: GoalStakeholderService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private _seo: SeoService
  ) { }

  async ngOnInit() { 
    
    this.authService.userProfile$.subscribe(async userProfile => {
      if (userProfile) {
        this._isLoggedIn = true

        const achieverGoals = this.goalStakeholderService.getGoals(userProfile.id, enumGoalStakeholder.achiever, false, true)
        const spectatorGoals = this.goalStakeholderService.getGoals(userProfile.id, enumGoalStakeholder.spectator, false, true)

        combineLatest<any[]>(achieverGoals, spectatorGoals).pipe(
          map(arr => arr.reduce((acc, cur) => acc.concat(cur)))
        ).subscribe(goals => {
          this._goals = goals.filter((thing, index, self) =>
            index === self.findIndex((t) => (
              t.id === thing.id
            ))
          )
        })

        this._finishedGoals = await this.goalStakeholderService.getGoals(userProfile.id, enumGoalStakeholder.achiever, false, false).pipe(take(1)).toPromise()

        this.collectiveGoalsColObs = this.collectiveGoalStakeholderService.getCollectiveGoals(userProfile.id)

      } else {
        this._isLoggedIn = false
      }
    })

    this._seo.generateTags({
      title: `Goals - Strive Journal`
    })

  }

  ionViewDidEnter() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => { 
        this.navCtrl.navigateRoot('explore')
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
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

  sortByCreatedAt(a, b) {
    if (a.createdAt < b.createdAt) return 1
    if (a.createdAt > b.createdAt) return -1
    return 0
  }

}
