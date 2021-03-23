import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { IonInfiniteScroll, NavController, Platform } from '@ionic/angular'
// Rxjs
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { GoalAuthGuardService } from '@strive/goal/goal/guards/goal-auth-guard.service'
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'

import { Profile } from '@strive/user/user/+state/user.firestore';

// Animation for Roadmap
declare const initMilestonesAnimation: Function;

@Component({
  selector: 'journal-goal-view',
  templateUrl: './goal-view.page.html',
  styleUrls: ['./goal-view.page.scss'],
})
export class GoalViewPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  pageIsLoading = true
  canAccess = false

  goalId: string
  goal: Goal

  stakeholders: GoalStakeholder[]

  segmentChoice: 'Goal' | 'Roadmap' | 'Posts' = 'Goal'

  backBtnSubscription: Subscription

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private goalAuthGuardService: GoalAuthGuardService,
    public stakeholder: GoalStakeholderService,
    private inviteTokenService: InviteTokenService,
    private navCtrl: NavController,
    private platform: Platform,
    private route: ActivatedRoute,
    private seo: SeoService
  ) { }

  async ngOnInit() {
    this.goalId = this.route.snapshot.paramMap.get('id')
    this.goal = await this.goalService.getValue(this.goalId)

    if (!this.goal) {
      this.initNoAccess()
      return
    }

    this.user.profile$.pipe(
      switchMap((profile: Profile) => !!profile ? this.stakeholder.valueChanges(profile.id, { goalId: this.goalId }) : of({})),
    ).subscribe(async (stakeholder: GoalStakeholder | undefined) => {
      let access = this.goal.publicity === 'public'
      if (!access && !!stakeholder) access = await this.goalAuthGuardService.checkAccess(this.goal, stakeholder)
      if (!access && !!stakeholder) access = await this.inviteTokenService.checkInviteToken('goal', this.goalId)
      access ? this.initGoal() : this.initNoAccess();
    })
  }

  private initGoal() {
    this.canAccess = true
    this.pageIsLoading = false
    this.seo.generateTags({
      title: `${this.goal.title} - Strive Journal`,
      description: this.goal.shortDescription,
      image: this.goal.image
    })
  }

  private initNoAccess() {
    this.pageIsLoading = false
    this.canAccess = false
    this.seo.generateTags({ title: `Page not found - Strive Journal` })
  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  public segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
    if (this.segmentChoice === 'Roadmap') {
      initMilestonesAnimation()
    }
  }
}
