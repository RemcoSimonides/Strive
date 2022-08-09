import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular'
// Rxjs
import { Subscription, of, Observable, shareReplay } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
// Services
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { GoalAuthGuardService } from '@strive/goal/goal/guards/goal-auth-guard.service'
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/user.service';
// Interfaces
import { Goal, createGoalStakeholder, GoalStakeholder } from '@strive/model'
// Components
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';

@Component({
  selector: 'journal-goal-view',
  templateUrl: './goal-view.page.html',
  styleUrls: ['./goal-view.page.scss'],
})
export class GoalViewComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;
  pageIsLoading = true
  canAccess = false

  goalId: string
  goal?: Goal

  isAdmin$?: Observable<boolean>

  segmentChoice: 'goal' | 'roadmap' | 'story' = 'goal'

  backBtnSubscription?: Subscription
  accessSubscription?: Subscription

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private goalAuthGuardService: GoalAuthGuardService,
    public stakeholder: GoalStakeholderService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private route: ActivatedRoute,
    private seo: SeoService
  ) {
    this.goalId = this.route.snapshot.paramMap.get('id') as string
  }

  async ngOnInit() {
    this.goal = await this.goalService.getValue(this.goalId)

    this.isAdmin$ = this.user.user$.pipe(
      tap(user => {
        if (user) this.stakeholder.updateLastCheckedGoal(this.goalId, user.uid)
      }),
      switchMap(user => user ? this.stakeholder.valueChanges(user.uid, { goalId: this.goalId }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder).isAdmin),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const { t } = this.route.snapshot.queryParams;
    this.segmentChoice = ['goal', 'roadmap', 'story'].includes(t) ? t : 'goal'

    if (!this.goal) {
      this.initNoAccess()
      return
    }

    this.accessSubscription = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholder.valueChanges(user.uid, { goalId: this.goalId }) : of(undefined)),
    ).subscribe(async (stakeholder: GoalStakeholder | undefined) => {
      let access = this.goal?.publicity === 'public'
      if (!access && stakeholder && this.goal) access = await this.goalAuthGuardService.checkAccess(this.goal, stakeholder)
      if (!access && stakeholder) access = await this.inviteTokenService.checkInviteToken(this.goalId)
      access ? this.initGoal() : this.initNoAccess();
    })
  }

  ngOnDestroy() {
    this.accessSubscription?.unsubscribe()
  }

  private initGoal() {
    this.canAccess = true
    this.pageIsLoading = false
    if (!this.goal) return
    this.seo.generateTags({
      title: `${this.goal.title} - Strive Journal`,
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
      this.backBtnSubscription?.unsubscribe();
    }
  }

  public segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
  }

  createCustomPost() {
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        goalId: this.goalId,
        postId: undefined
      }
    }).then(modal => modal.present())
  }
}
