import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, Platform, NavController, ModalController } from '@ionic/angular';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { ProfileService } from 'apps/journal/src/app/services/profile/profile.service';
import { UserSpectateService } from 'apps/journal/src/app/services/user/user-spectate.service';
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';
// import { FcmService } from 'src/app/services/fcm/fcm.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { ExercisesService } from 'apps/journal/src/app/services/exercises/exercises.service';
// Rxjs
import { Observable } from 'rxjs';
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
  IProfile,
  IGoal,
  enumGoalPublicity,
  enumGoalStakeholder,
  ISpectator,
  IAffirmations,
  IBucketList,
  enumPrivacy,
  IBucketListItem
} from '@strive/interfaces';
// Other
import { goalSlideOptions } from '../../../theme/goal-slide-options'
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  _backBtnSubscription
  public _pageIsLoading: boolean;
  public _shouldLogin: boolean;

  private _profileId: string

  // enums
  public enumEdited = enumEdited
  public enumGoalPublicity = enumGoalPublicity
  public enumExercises = enumExercises
  public enumPrivacy = enumPrivacy

  public _goalSlideOptions = goalSlideOptions

  public _chosenPicture: any

  public _isOwner: boolean = false
  public _isSpectator: boolean = false
  public _editableProfileUsername: boolean = false

  public profileDocObs: Observable<IProfile>

  public _achievingGoalsColObs: Observable<IGoal[]>
  public _supportingGoalsColObs: Observable<IGoal[]>

  public _profile = <IProfile>{}
  private originalProfile = <IProfile>{}

  public _affirmationsDocObs: Observable<IAffirmations>
  public _affirmations = <IAffirmations>{}
  public _bucketListDocObs: Observable<IBucketList>
  public _bucketList: IBucketList = <IBucketList>{}

  public _spectators: ISpectator[]
  public _spectating: ISpectator[]

  public segmentChoice: string = "info"

  constructor(
    public authService: AuthService,
    private goalStakeholderService: GoalStakeholderService,
    private exerciseService: ExercisesService,
    private _imageService: ImageService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private userSpectateService: UserSpectateService
  ) { }

  async ngOnInit() {
    this._pageIsLoading = true
    this._profileId = this.route.snapshot.paramMap.get('id')
    const { uid } = await this.authService.afAuth.currentUser
    if (this._profileId === 'undefined') {
      if (await this.authService.isLoggedIn()) {
        this.router.navigateByUrl(`profile/${uid}`)
      } else {
        this._shouldLogin = true
      }
    }

    await  this.authService.getCurrentuserProfileObs().subscribe(async (userProfile) => {
      if (userProfile) {
        if (userProfile.id === this._profileId) {
          this._isOwner = true
        } else {
          this._isOwner = false
          await this.userSpectateService.getSpectator(userProfile.id, this._profileId).then(spectator => {
            this._isSpectator = spectator.isSpectator
          })
        }
      } else {
        this._isOwner = false
        this._isSpectator = false
      }
    })

    this._profile = await this.profileService.getProfile(this._profileId)

    // get affirmations
    this._affirmationsDocObs = await this.exerciseService.getAffirmationsDocObs(this._profileId)
    this._affirmationsDocObs.subscribe(affirmations => this._affirmations = affirmations)

    // get  bucketlist
    this._bucketListDocObs = await this.exerciseService.getBucketListDocObs(this._profileId)
    this._bucketListDocObs.subscribe(bucketList  => this._bucketList = bucketList)

    // Save original values to later check for changes
    Object.assign(this.originalProfile, this._profile)

    this.seo.generateTags({
      title: `${this._profile.username} - Strive Journal`
    })

    this._achievingGoalsColObs = this.goalStakeholderService.getGoals2(this._profileId, enumGoalStakeholder.achiever);
    this._supportingGoalsColObs = this.goalStakeholderService.getGoals2(this._profileId, enumGoalStakeholder.supporter)
    this._pageIsLoading = false

  }

  ionViewDidEnter() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => { 
        this.navCtrl.back()
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

  public async segmentChanged(segment: string): Promise<void> {

    this.segmentChoice = segment
    if (segment === "spectators") {
      this._spectators = await this.userSpectateService.getSpectators(this._profileId)
    } else if (segment === "spectating") {
      this._spectating = await this.userSpectateService.getSpectating(this._profileId)
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
          this.authService.signOut()
          break
      }
    })

  }

  public async updateProfile(event: UIEvent, eventType: any): Promise<void> {

    // Check for changes
    if (this._profile !== this.originalProfile) {

      await this.profileService.upsert(this._profile)
    
    }

  }

  public async editProfileImage(ev: UIEvent): Promise<void> {

    if (!this._isOwner) return

      const popover = await this.popoverCtrl.create({
        component: EditProfileImagePopoverPage,
        event: ev
      })
      popover.onDidDismiss().then((imageURL => {
        if (imageURL && imageURL.data) {
          this._profile.image = imageURL.data.toString()
        }
      }))
      await popover.present()

  }

  public async _saveProfileUsername(){

    if (!this._profile.username || !this._isOwner) return

    await this.profileService.upsert({username:  this._profile.username})

    this._editableProfileUsername = false

  }

  async toggleSpectate(): Promise<void> {

    const isLoggedIn = await this.authService.isLoggedIn()
    if (isLoggedIn) {

      this.userSpectateService.toggleSpectate(this._profileId)
      this._isSpectator = !this._isSpectator
      this._isSpectator ? this._profile.numberOfSpectators += 1 : this._profile.numberOfSpectators -= 1 

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

    if (!this._isOwner) return
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

  async completeBucketListItem(item: IBucketListItem): Promise<void> {

    if (!this._isOwner) return

    this._bucketList.items.forEach((x) => {
      if (x.description === item.description) {
        x.completed = !x.completed
      }
    })
    await this.exerciseService.saveBucketList(this._profileId, this._bucketList)
  }
}

enum enumEdited {
  username,
  image
}

enum enumExercises {
  affirmations,
  bucketlist,
  dear_future_self,
  daily_gratefulness,
  assess_life
}