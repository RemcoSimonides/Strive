import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular'
// Rxjs
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { PostService } from '@strive/post/+state/post.service';
import { InviteTokenService } from 'apps/journal/src/app/services/invite-token/invite-token.service';
import { GoalAuthGuardService } from '@strive/goal/goal/guards/goal-auth-guard.service'
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
// Interfaces
import { Post, enumPostSource } from '@strive/post/+state/post.firestore';
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

  // user rights
  isAdmin = false
  isAchiever = false
  isSupporter = false
  isSpectator = false
  hasOpenRequestToJoin = false

  segmentChoice: 'Goal' | 'Roadmap' | 'Posts' = "Goal"

  backBtnSubscription: Subscription

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private goalAuthGuardService: GoalAuthGuardService,
    public stakeholder: GoalStakeholderService,
    private imageService: ImageService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public paginationService: NotificationPaginationService,
    private platform: Platform,
    private postService: PostService,
    private route: ActivatedRoute,
    private seo: SeoService
  ) { }

  async ngOnInit() {
    this.goalId = this.route.snapshot.paramMap.get('id')
    this.goal = await this.goalService.getGoal(this.goalId)

    if (!this.goal) {
      this.initNoAccess()
      return
    }

    this.user.profile$.pipe(
      switchMap((profile: Profile) => !!profile ? this.stakeholder.getStakeholder$(profile.id, this.goalId) : of({})),
    ).subscribe(async (stakeholder: GoalStakeholder | undefined) => {

      let access = this.goal.publicity === 'public'

      if (!!stakeholder) {
        // this.isAchiever = stakeholder.isAchiever
        // this.isAdmin = stakeholder.isAdmin
        // this.isSupporter = stakeholder.isSupporter
        // this.isSpectator = stakeholder.isSpectator
        // this.hasOpenRequestToJoin = stakeholder.hasOpenRequestToJoin

        if (!access) access = await this.goalAuthGuardService.checkAccess(this.goal, stakeholder)
        if (!access) access = await this.inviteTokenService.checkInviteToken('goal', this.goalId)

      } else {

        // this.isAchiever = false
        // this.isAdmin = false
        // this.isSupporter = false
        // this.isSpectator = false
        // this.hasOpenRequestToJoin = false
      }

      access ? this.initGoal() : this.initNoAccess();
    })
  }

  public async initGoal() {
    this.canAccess = true

    // SEO
    this.seo.generateTags({
      title: `${this.goal.title} - Strive Journal`,
      description: this.goal.shortDescription,
      image: this.goal.image
    })

    // Posts
    this.paginationService.reset()
    this.paginationService.init(`Goals/${this.goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    this.pageIsLoading = false

  }

  public initNoAccess() {
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

  //Posts section
  public loadData(event) {
    this.paginationService.more()
    event.target.complete();

    if (this.paginationService.done) {
      event.target.disabled = true
    }
  }

  public refreshPosts($event) {

    this.paginationService.refresh(`Goals/${this.goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    this.paginationService.refreshing.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })

  }

  public async createCustomPost() {

    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {

      if (data.data) {
        const post = <Post>{}

        // Prepare post object
        post.content = {
          title: data.data.title,
          description: data.data.description,
          mediaURL: await this.imageService.uploadImage(`Goals/${this.goalId}/Posts/${this.goalId}`, false)
        }
        post.goal = {
          id: this.goalId,
          title: this.goal.title,
          image: this.goal.image,
        }
        post.isEvidence = false

        // Create post
        await this.postService.createPost(enumPostSource.custom, this.goalId, post)

      }
      await this.imageService.reset()

      await this.paginationService.refresh(`Goals/${this.goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    })

  }

}
