import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { IonInfiniteScroll, LoadingController, ModalController, NavController, PopoverController, AlertController, Platform } from '@ionic/angular'
// Rxjs
import { Observable, empty, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
// Services
import { FirestoreService } from '../../services/firestore/firestore.service'
import { GoalService } from 'apps/journal/src/app/services/goal/goal.service';
import { GoalStakeholderService } from '../../services/goal/goal-stakeholder.service'
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { RoadmapService } from 'apps/journal/src/app/services/roadmap/roadmap.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { PostService } from 'apps/journal/src/app/services/post/post.service';
import { InviteTokenService } from 'apps/journal/src/app/services/invite-token/invite-token.service';
import { GoalAuthGuardService } from 'apps/journal/src/app/services/goal/goal-auth-guard.service';
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
// Pages / Popover / Modal
import { CreateGoalPage } from './modals/create-goal/create-goal.page';
import { GoalOptionsPopoverPage, enumGoalOptions } from './popovers/goal-options-popover/goal-options-popover.page'
import { GoalSharePopoverPage } from './popovers/goal-share-popover/goal-share-popover.page';
import { AddSupportModalPage } from './modals/add-support-modal/add-support-modal.page'
import { DiscussionPage } from '../discussion/discussion.page';
import { CreatePostModalPage } from './posts/create-post-modal/create-post-modal.page';
// Interfaces
import { IGoal, enumGoalPublicity } from 'apps/journal/src/app/interfaces/goal.interface';
import { IGoalStakeholder } from 'apps/journal/src/app/interfaces/goal-stakeholder.interface';
import { IPost, enumPostSource } from 'apps/journal/src/app/interfaces/post.interface';

import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

// Animation for Roadmap
declare var initMilestonesAnimation: any;

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.scss'],
})
export class GoalPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  _pageIsLoading: boolean
  _isLoggedIn: boolean
  _goalExistsAndUserHasAccess: boolean
  private _backBtnSubscription: Subscription

  enumGoalPublicity = enumGoalPublicity

  public goalDocObs: Observable<IGoal>
  public _goal: IGoal
  public _goalId: string
  public _isFinished: boolean = false

  public _stakeholders: IGoalStakeholder[]

  // user rights
  public _isAdmin: boolean = false
  public _isAchiever: boolean = false
  public _isSupporter: boolean = false
  public _isSpectator: boolean = false
  public _hasOpenRequestToJoin: boolean = false

  public segmentChoice: string = "Goal"

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService,
    private db: FirestoreService,
    private goalService: GoalService,
    private goalAuthGuardService: GoalAuthGuardService,
    public goalStakeholderService: GoalStakeholderService,
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
    this._pageIsLoading = true
    this._goalId = this.route.snapshot.paramMap.get('id')
    this._goal = await this.goalService.getGoal(this._goalId)

    if (!this._goal.title) {
      this.initNoAccess()
      return
    }

    this.authService.userProfile$.pipe(
      switchMap(userProfile => {
        if (userProfile) {

          this._isLoggedIn = true
          return this.goalStakeholderService.getStakeholderDocObs(userProfile.id, this._goalId)

        } else {

          this._isAchiever = false
          this._isAdmin = false
          this._isSupporter = false
          this._isSpectator = false
          this._hasOpenRequestToJoin = false
          this._isLoggedIn = false

          // empty observable does not trigger subscribe so init public goal (without being logged in) here
          if (this._goal.publicity === enumGoalPublicity.public) {
            this.initGoal()
          } else {

            // check invite token
            this.route.queryParams.subscribe(data => {
              if (data.invite_token) {

                const access = this.inviteTokenService.checkInviteTokenOfGoal(this._goalId, data.invite_token)
                access ? this.initGoal() : this.initNoAccess()

              } else {
                // no access
                this.initNoAccess()
              }
            })

          }

          return empty()
        }

      })
    ).subscribe(async stakeholder => {

      if (stakeholder) {
        this._isAchiever = stakeholder.isAchiever
        this._isAdmin = stakeholder.isAdmin
        this._isSupporter = stakeholder.isSupporter
        this._isSpectator = stakeholder.isSpectator
        this._hasOpenRequestToJoin = stakeholder.hasOpenRequestToJoin
      }

      let access: boolean = await this.goalAuthGuardService.checkAccess(this._goal, stakeholder)
      if (!access) {
        this.route.queryParams.subscribe(data => {
          if (data.invite_token) {
            const access = this.inviteTokenService.checkInviteTokenOfGoal(this._goalId, data.invite_token)
            access ? this.initGoal() : this.initNoAccess()
          } else {
            this.initNoAccess()
          }
        })
      } else {
        this.initGoal()
      }

    })

  }

  public async initGoal(): Promise<void> {

    this._goalExistsAndUserHasAccess = true

    // get goal stakeholders
    const colRef = this.db.col<IGoalStakeholder>(`Goals/${this._goalId}/GStakeholders`)
    const colSnap = await colRef.get().toPromise()
    this._stakeholders = colSnap.docs.map<IGoalStakeholder>(doc => {
      const data = doc.data()
      const id = doc.id
      return Object.assign(<IGoalStakeholder>{}, { id, ...data })
    })

    // SEO
    this.seo.generateTags({
      title: `${this._goal.title} - Strive Journal`,
      description: this._goal.shortDescription,
      image: this._goal.image
    })

    // Posts
    this.paginationService.reset()
    this.paginationService.init(`Goals/${this._goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    this._pageIsLoading = false

  }

  public async initNoAccess(): Promise<void> {

    this._goalExistsAndUserHasAccess = false

    // SEO
    this.seo.generateTags({ title: `Page not found - Strive Journal` })

    this._pageIsLoading = false

  }

  ionViewDidEnter() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

  public async segmentChanged(ev: CustomEvent): Promise<void> {
    this.segmentChoice = ev.detail.value
    if (ev.detail.value === "Roadmap") {
      initMilestonesAnimation()
    }
  }

  // Goal section
  public async openDiscussion(): Promise<void> {

    const modal = await this.modalCtrl.create({
      component: DiscussionPage,
      componentProps: {
        discussionId: this._goalId
      }
    })
    await modal.present()

  }

  public async presentGoalOptionsPopover(ev: UIEvent): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this._isAdmin,
        publicity: this._goal.publicity,
        isFinished: this._goal.isFinished
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
      subHeader: `To prevent mistakes, I have to ask whether you are sure the  goal is finished. Is it?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {

            await this.goalService.finishGoal(this._goalId)
            this._goal.isFinished = true
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
      component: CreatePostModalPage,
      componentProps: {
        title: this._goal.title,
        achievedComponent: "Goal"
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {
      if (data.data) {
        const post = <IPost>{}

        // Prepare post object
        post.content = {
          title: data.data.title,
          description: data.data.description,
          mediaURL: await this.imageService.uploadImage(`Goals/${this._goalId}/Posts/${this._goalId}`, false)
        }
        post.goal = {
          id: this._goalId,
          title: this._goal.title,
          image: this._goal.image
        }
        post.isEvidence = true

        // Create post
        await this.postService.createPost(enumPostSource.goal, this._goalId, post, this._goalId)
      }
      await this.imageService.reset()
    })

  }

  public async editGoal(): Promise<void> {
    const goal = await this.goalService.getGoal(this._goalId)

    const modal = await this.modalCtrl.create({
      component: CreateGoalPage,
      componentProps: {
        currentGoal: goal
      }
    })
    await modal.present()

    await modal.onDidDismiss().then(async () => {
      this._goal = await this.goalService.getGoal(this._goalId)
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

            await this.goalStakeholderService.delete(this._goalId)
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
        goalId: this._goalId
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

    const { uid } = await this.authService.afAuth.currentUser
    const goal = await this.goalService.getGoal(this._goalId)

    // Creating goal
    const goalId = await this.goalService.duplicateGoal(goal)

    // Creating stakeholder
    await this.goalStakeholderService.upsert(uid, goalId, {
      isAdmin: true,
      isAchiever: true
    })

    // Wait for stakeholder to be created before making milestones because you need admin rights for that
    this.db.docWithId$<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)
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

  public async requestToJoinGoal(): Promise<void> {

    const { uid } = await this.authService.afAuth.currentUser

    await this.goalStakeholderService.upsert(uid, this._goalId, {
      isSpectator: true,
      hasOpenRequestToJoin: true
    })

  }

  public async _openSharePopover(ev: UIEvent): Promise<void> {

    if (this._platform.is('android') || this._platform.is('ios')) {

      const isPublic: boolean = this._goal.publicity === enumGoalPublicity.public ? true : false
      const ref = await this.inviteTokenService.getShareLink(this._goalId, false, isPublic, this._isAdmin)

      let shareRet = await Share.share({
        title: this._goal.title,
        text: 'Check out this goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {

      const popover = await this.popoverCtrl.create({
        component: GoalSharePopoverPage,
        event: ev,
        componentProps: {
          goal: this._goal,
          isAdmin: this._isAdmin
        }
      })
      await popover.present()

    }





  }

  public async _saveDescription(description: string): Promise<void> {

    this._goal.description = description

    await this.db.upsert(`Goals/${this._goalId}`, {
      description: description
    })

  }

  public async toggleAdmin(stakeholder: IGoalStakeholder): Promise<void> {

    event.preventDefault()
    event.stopPropagation()

    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {

            this.goalStakeholderService.upsert(stakeholder.id, this._goalId, {
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

  public async toggleAchiever(stakeholder: IGoalStakeholder): Promise<void> {

    event.preventDefault()
    event.stopPropagation()

    this.goalStakeholderService.upsert(stakeholder.id, this._goalId, {
      isAchiever: !stakeholder.isAchiever
    })

  }

  public async toggleSupporter(stakeholder: IGoalStakeholder): Promise<void> {

    event.preventDefault()
    event.stopPropagation()

    this.goalStakeholderService.upsert(stakeholder.id, this._goalId, {
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

  public async refreshPosts($event) {

    await this.paginationService.refresh(`Goals/${this._goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

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
      component: CreatePostModalPage,
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {

      if (data.data) {
        const post = <IPost>{}

        // Prepare post object
        post.content = {
          title: data.data.title,
          description: data.data.description,
          mediaURL: await this.imageService.uploadImage(`Goals/${this._goalId}/Posts/${this._goalId}`, false)
        }
        post.goal = {
          id: this._goalId,
          title: this._goal.title,
          image: this._goal.image,
        }
        post.isEvidence = false

        // Create post
        await this.postService.createPost(enumPostSource.custom, this._goalId, post)

      }
      await this.imageService.reset()

      await this.paginationService.refresh(`Goals/${this._goalId}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    })

  }

}
