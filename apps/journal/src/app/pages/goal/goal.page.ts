import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { IonInfiniteScroll, LoadingController, ModalController, NavController, PopoverController, AlertController, Platform } from '@ionic/angular'
// Rxjs
import { Subscription, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
// Services
import { FirestoreService } from '../../services/firestore/firestore.service'
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { RoadmapService } from 'apps/journal/src/app/services/roadmap/roadmap.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { PostService } from '@strive/post/+state/post.service';
import { InviteTokenService } from 'apps/journal/src/app/services/invite-token/invite-token.service';
import { GoalAuthGuardService } from '@strive/goal/goal/guards/goal-auth-guard.service'
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Pages / Popover / Modal
import { CreateGoalPage } from './modals/create-goal/create-goal.page';
import { GoalOptionsPopoverPage, enumGoalOptions} from './popovers/options/options.component';
import { GoalSharePopoverPage } from './popovers/share/share.component';
import { AddSupportModalPage } from './modals/add-support-modal/add-support-modal.page'
import { DiscussionPage } from '../discussion/discussion.page';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
// Interfaces
import { Post, enumPostSource } from '@strive/post/+state/post.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'

import { Plugins } from '@capacitor/core';
import { Profile } from '@strive/user/user/+state/user.firestore';
const { Share } = Plugins;

// Animation for Roadmap
declare const initMilestonesAnimation: Function;

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.scss'],
})
export class GoalPage implements OnInit {
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
    private alertCtrl: AlertController,
    public user: UserService,
    private db: FirestoreService,
    private goalService: GoalService,
    private goalAuthGuardService: GoalAuthGuardService,
    public stakeholder: GoalStakeholderService,
    private imageService: ImageService,
    private inviteTokenService: InviteTokenService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public paginationService: NotificationPaginationService,
    private _platform: Platform,
    private popoverCtrl: PopoverController,
    private postService: PostService,
    private roadmapService: RoadmapService,
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
      switchMap((profile: Profile) => !!profile ? this.stakeholder.getStakeholderDocObs(profile.id, this.goalId) : of({})),
    ).subscribe(async (stakeholder: GoalStakeholder | undefined) => {

      let access = this.goal.publicity === 'public'

      if (!!stakeholder) {
        this.isAchiever = stakeholder.isAchiever
        this.isAdmin = stakeholder.isAdmin
        this.isSupporter = stakeholder.isSupporter
        this.isSpectator = stakeholder.isSpectator
        this.hasOpenRequestToJoin = stakeholder.hasOpenRequestToJoin

        if (!access) access = await this.goalAuthGuardService.checkAccess(this.goal, stakeholder)
        if (!access) access = await this.inviteTokenService.checkInviteToken('goal', this.goalId)

      } else {

        this.isAchiever = false
        this.isAdmin = false
        this.isSupporter = false
        this.isSpectator = false
        this.hasOpenRequestToJoin = false
      }

      access ? this.initGoal() : this.initNoAccess();
    })
  }

  public async initGoal() {

    this.canAccess = true

    // get goal stakeholders
    const colRef = this.db.col<GoalStakeholder>(`Goals/${this.goalId}/GStakeholders`)
    const colSnap = await colRef.get().toPromise()
    this.stakeholders = colSnap.docs.map<GoalStakeholder>(doc => {
      const data = doc.data()
      const id = doc.id
      return Object.assign(<GoalStakeholder>{}, { id, ...data })
    })

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
    if (this._platform.is('android') || this._platform.is('ios')) {
      this.backBtnSubscription = this._platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  public segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
    if (this.segmentChoice === 'Roadmap') {
      initMilestonesAnimation()
    }
  }

  // Goal section
  public async openDiscussion(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DiscussionPage,
      componentProps: {
        discussionId: this.goalId
      }
    })
    await modal.present()
  }

  public async presentGoalOptionsPopover(ev: UIEvent): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
        isFinished: this.goal.isFinished
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumGoalOptions.EditNotificationSettings:
          console.log('not supported yet')
          break
        case enumGoalOptions.DuplicateGoal:
          this.duplicateGoal()
          break
        case enumGoalOptions.FinishGoal:
          this.finishGoal()
          break
        case enumGoalOptions.editGoal:
          this.editGoal()
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })

  }

  public async finishGoal(): Promise<void> {

    const alert = await this.alertCtrl.create({
      header: `Awesomeness! One step closer to whatever you want to achieve in life :)`,
      subHeader: `To prevent mistakes, I have to ask whether you are sure the goal is finished. Is it?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {

            await this.goalService.finishGoal(this.goalId)
            this.goal.isFinished = true
            this.startPostCreation()

          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })
    await alert.present()
  }

  private async startPostCreation() {

    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        title: this.goal.title,
        achievedComponent: 'Goal'
      }
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
          image: this.goal.image
        }
        post.isEvidence = true

        // Create post
        await this.postService.createPost(enumPostSource.goal, this.goalId, post, this.goalId)
      }
      await this.imageService.reset()
    })

  }

  public async editGoal(): Promise<void> {
    console.log('edit goal is called: ', this.editGoal);
    const goal = await this.goalService.getGoal(this.goalId)

    const modal = await this.modalCtrl.create({
      component: CreateGoalPage,
      componentProps: {
        currentGoal: goal
      }
    })
    await modal.present()

    await modal.onDidDismiss().then(async () => {
      this.goal = await this.goalService.getGoal(this.goalId)
    })
  }

  public async deleteGoal(): Promise<void> {

    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {

            await this.stakeholder.delete(this.goalId)
            await this.navCtrl.navigateRoot(`/explore`)

          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })

    await alert.present()

  }

  public async supportGoal(): Promise<void> {

    const supportModal = await this.modalCtrl.create({
      component: AddSupportModalPage,
      componentProps: {
        goalId: this.goalId
      }
    })
    await supportModal.present()

  }

  public async duplicateGoal(): Promise<void> {

    const loading = await this.loadingCtrl.create({
      message: `Duplicating goal`,
      spinner: 'lines'
    })
    await loading.present()

    const goal = await this.goalService.getGoal(this.goalId)

    // Creating goal
    const goalId = await this.goalService.duplicateGoal(goal)

    // Creating stakeholder
    await this.stakeholder.upsert(this.user.uid, goalId, {
      isAdmin: true,
      isAchiever: true
    })

    // Wait for stakeholder to be created before making milestones because you need admin rights for that
    this.db.docWithId$<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${this.user.uid}`)
      .pipe(take(2))
      .subscribe(async stakeholder => {
        if (stakeholder) {
          if (stakeholder.isAdmin) {
            this.roadmapService.duplicateMilestones(goalId, goal.milestoneTemplateObject)
            await loading.dismiss()
            this.navCtrl.navigateRoot(`goal/${goalId}`)
          }
        }
      })

  }

  public requestToJoinGoal() {
    return this.stakeholder.upsert(this.user.uid, this.goalId, {
      isSpectator: true,
      hasOpenRequestToJoin: true
    })
  }

  public async openSharePopover(ev: UIEvent): Promise<void> {

    if (this._platform.is('android') || this._platform.is('ios')) {

      const isPublic: boolean = this.goal.publicity === 'public' ? true : false
      const ref = await this.inviteTokenService.getShareLink(this.goalId, false, isPublic, this.isAdmin)

      let shareRet = await Share.share({
        title: this.goal.title,
        text: 'Check out this goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {

      const popover = await this.popoverCtrl.create({
        component: GoalSharePopoverPage,
        event: ev,
        componentProps: {
          goal: this.goal,
          isAdmin: this.isAdmin
        }
      })
      await popover.present()

    }
  }

  public async saveDescription(description: string): Promise<void> {
    this.goal.description = description
    await this.db.upsert(`Goals/${this.goalId}`, {
      description: description
    })
  }

  public async toggleAdmin(stakeholder: GoalStakeholder): Promise<void> {
    event.preventDefault()
    event.stopPropagation()
    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {

            this.stakeholder.upsert(stakeholder.id, this.goalId, {
              isAdmin: !stakeholder.isAdmin
            })

          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })

    await alert.present()
  }

  public async toggleAchiever(stakeholder: GoalStakeholder): Promise<void> {
    event.preventDefault()
    event.stopPropagation()
    this.stakeholder.upsert(stakeholder.id, this.goalId, {
      isAchiever: !stakeholder.isAchiever
    })
  }

  public async toggleSupporter(stakeholder: GoalStakeholder): Promise<void> {
    event.preventDefault()
    event.stopPropagation()
    this.stakeholder.upsert(stakeholder.id, this.goalId, {
      isSupporter: !stakeholder.isSupporter
    })
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
