import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, Platform, NavController, ModalController } from '@ionic/angular';
// Services
import { UserSpectateService } from '@strive/user/user/+state/user-spectate.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service'
// import { FcmService } from '@strive/utils/services/fcm.service';
import { ImageService } from '@strive/media/+state/image.service';
import { ExercisesService } from '@strive/exercises/+state/exercises.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Rxjs
import { Observable, Subscription } from 'rxjs';
// Modals / Popover
import { EditProfileImagePopoverPage } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'
import { ProfileOptionsPage, enumProfileOptions } from './popovers/profile-options/profile-options.page';
import { ExerciseAffirmationPage } from './modals/exercise-affirmation/exercise-affirmation.page';
import { ExerciseBucketlistPage } from './modals/exercise-bucketlist/exercise-bucketlist.page';
import { ExerciseDearFutureSelfPage } from './modals/exercise-dear-future-self/exercise-dear-future-self.page';
import { ExerciseDailyGratefulnessPage } from './modals/exercise-daily-gratefulness/exercise-daily-gratefulness.page';
import { ExerciseAssessLifePage } from './modals/exercise-assess-life/exercise-assess-life.page';
// Interfaces
import {
  ISpectator,
  IAffirmations,
  IBucketList,
  enumPrivacy,
  IBucketListItem
} from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
// Other
import { SeoService } from '@strive/utils/services/seo.service';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { AngularFireAuth } from '@angular/fire/auth';

// CONTINUE WITH REWORKING THIS PAGE 🤣 AND ADDING INDEXESd

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  private backBtnSubscription: Subscription
  public pageIsLoading: boolean = true

  public shouldLogin: boolean = false

  private profileId: string

  // enums
  public enumExercises = enumExercises
  public enumPrivacy = enumPrivacy

  public _chosenPicture: any

  public isOwner = false
  public isSpectator = false
  public editableProfileUsername = false

  public profileDocObs: Observable<Profile>

  public achievingGoals$: Observable<Goal[]>
  public supportingGoals$: Observable<Goal[]>

  public profile = <Profile>{}
  private originalProfile = <Profile>{}

  public affirmations$: Observable<IAffirmations>
  public _affirmations = <IAffirmations>{}
  public bucketList$: Observable<IBucketList>
  public _bucketList: IBucketList = <IBucketList>{}

  public _spectators: ISpectator[]
  public _spectating: ISpectator[]

  public segmentChoice = 'info'

  constructor(
    private afAuth: AngularFireAuth,
    public user: UserService,
    private goalStakeholderService: GoalStakeholderService,
    private exerciseService: ExercisesService,
    private _imageService: ImageService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private userSpectateService: UserSpectateService
  ) { }

  async ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')

    this.user.profile$.subscribe(async profile => {
      if (profile) {
        this.isOwner = profile.id === this.profileId
        if (!this.isOwner) {
          this.isSpectator = (await this.userSpectateService.getSpectator(profile.id, this.profileId)).isSpectator
        }
      } else {
        this.isOwner = false
        this.isSpectator = false
      }
    })

    if (this.profileId === 'undefined') {
      if (this.user.uid) {
        this.router.navigateByUrl(`profile/${this.user.uid}`)
      } else {
        this.shouldLogin = true
      }
    }

    this.profile = await this.user.getProfile(this.profileId)

    // get affirmations
    this.affirmations$ = this.exerciseService.getAffirmationsDocObs(this.profileId)
    this.affirmations$.subscribe(affirmations => this._affirmations = affirmations)

    // get  bucketlist
    this.bucketList$ = this.exerciseService.getBucketListDocObs(this.profileId)
    this.bucketList$.subscribe(bucketList  => this._bucketList = bucketList)

    // Save original values to later check for changes
    Object.assign(this.originalProfile, this.profile)

    this.seo.generateTags({ title: `${this.profile.username} - Strive Journal` })

    this.achievingGoals$ = this.goalStakeholderService.getGoals(this.profileId, enumGoalStakeholder.achiever, !this.isOwner);
    this.supportingGoals$ = this.goalStakeholderService.getGoals(this.profileId, enumGoalStakeholder.supporter, !this.isOwner)
    this.pageIsLoading = false
  }

  ionViewDidEnter() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { 
        this.navCtrl.back()
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
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

  public async segmentChanged(segment: string): Promise<void> {

    this.segmentChoice = segment
    if (segment === "spectators") {
      this._spectators = await this.userSpectateService.getSpectators(this.profileId)
    } else if (segment === "spectating") {
      this._spectating = await this.userSpectateService.getSpectating(this.profileId)
    } else if (segment === "info") {

    }

  }

  public async presentProfileOptionsPopover(ev: UIEvent): Promise<void> {

    const popover = await this.popoverCtrl.create({
      component: ProfileOptionsPage,
      event: ev
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumProfileOptions.pushNotificationPermission:
          // if (this._platform.is('cordova')) {
          //   this.fcmService.getPermissionCordova()
          // } else {
          //   this.fcmService.getPermission().subscribe()
          // }
          break
        case enumProfileOptions.logOut:
          this.afAuth.signOut()
          break
      }
    })

  }

  public async updateProfile() {
    // Check for changes
    if (this.profile !== this.originalProfile) {
      return this.user.upsertProfile(this.profile)
    }
  }

  public async editProfileImage(ev: UIEvent): Promise<void> {

    if (!this.isOwner) return

      const popover = await this.popoverCtrl.create({
        component: EditProfileImagePopoverPage,
        event: ev
      })
      popover.onDidDismiss().then((imageURL => {
        if (imageURL && imageURL.data) {
          this.profile.photoURL = imageURL.data.toString()
        }
      }))
      await popover.present()

  }

  public saveProfileUsername(){
    if (!this.profile.username || !this.isOwner) return

    this.user.upsertProfile({username:  this.profile.username})

    this.editableProfileUsername = false
  }

  async toggleSpectate() {

    if (this.user.uid) {

      this.userSpectateService.toggleSpectate(this.profileId)
      this.isSpectator = !this.isSpectator
      this.isSpectator ? this.profile.numberOfSpectators += 1 : this.profile.numberOfSpectators -= 1 

    } else {
      const modal = await this._modalCtrl.create({
        component: AuthModalPage,
        componentProps: {
          authSegment: enumAuthSegment.register
        }
      })
      await modal.present()
    }

  }

  async openExercise(enumExercise: enumExercises) {

    if (!this.isOwner) return
    let modal

    switch (enumExercise) {
      case enumExercises.affirmations:
        modal = await this._modalCtrl.create({
          component: ExerciseAffirmationPage
        })  
        break
      
      case enumExercises.bucketlist:
        modal = await this._modalCtrl.create({
          component: ExerciseBucketlistPage
        })
        break
      
      case enumExercises.dear_future_self:
        modal = await this._modalCtrl.create({
          component: ExerciseDearFutureSelfPage
        })
        break

      case enumExercises.daily_gratefulness:
        modal = await this._modalCtrl.create({
          component: ExerciseDailyGratefulnessPage
        })
        break

      case enumExercises.assess_life:
        modal = await this._modalCtrl.create({
          component: ExerciseAssessLifePage
        })
        break
    }

    await modal.present()

  }

  async completeBucketListItem(item: IBucketListItem) {
    if (!this.isOwner) return

    this._bucketList.items.forEach((x) => {
      if (x.description === item.description) {
        x.completed = !x.completed
      }
    })
    await this.exerciseService.saveBucketList(this.profileId, this._bucketList)
  }
}

enum enumExercises {
  affirmations,
  bucketlist,
  dear_future_self,
  daily_gratefulness,
  assess_life
}