import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, Platform, NavController, ModalController } from '@ionic/angular';
// Services
import { UserSpectateService } from '@strive/user/spectator/+state/spectator.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { ProfileService } from '@strive/user/user/+state/profile.service';
// Rxjs
import { Observable, Subscription } from 'rxjs';
// Modals / Popover
import { EditProfileImagePopoverPage } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'
import { ProfileOptionsPage } from './popovers/profile-options/profile-options.page';
import { AffirmationUpsertComponent } from '@strive/exercises/affirmation/components/upsert/upsert.component';
import { BucketListUpsertComponent } from '@strive/exercises/bucket-list/components/upsert/upsert.component';
import { DailyGratefulnessUpsertComponent } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.component';
import { AssessLifeUpsertComponent } from '@strive/exercises/assess-life/components/upsert/upsert.component';
import { DearFutureSelfUpsertComponent } from '@strive/exercises/dear-future-self/components/upsert/upsert.component';
import { FollowingComponent } from '@strive/user/spectator/components/following/following.component';
import { FollowersComponent } from '@strive/user/spectator/components/followers/followers.component';
// Interfaces
import { Spectator } from '@strive/user/spectator/+state/spectator.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
// Other
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { ProfileForm } from '@strive/user/user/forms/user.form';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  private backBtnSubscription: Subscription
  private rightsSubscription: Subscription

  public enumExercises = enumExercises

  public isOwner = false
  public isSpectator = false

  public profileId: string
  public profile$: Observable<Profile>
  public profileForm = new ProfileForm()

  public achievingGoals$: Observable<Goal[]>
  public supportingGoals$: Observable<Goal[]>

  public spectators: Spectator[]
  public spectating: Spectator[]

  public segmentChoice = 'info'

  constructor(
    public user: UserService,
    private profileService: ProfileService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private userSpectateService: UserSpectateService,
    public screensize: ScreensizeService
  ) { }

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')
    this.profileForm.disable();

    this.rightsSubscription = this.user.profile$.subscribe(async profile => {
      if (!!profile) {
        if (!this.profileId) return this.router.navigateByUrl(`profile/${this.user.uid}`);

        this.isOwner = profile.id === this.profileId
        if (!this.isOwner) {
          this.isSpectator = (await this.userSpectateService.getSpectator(profile.id, this.profileId)).isSpectator
        }
      } else {
        this.isOwner = false
        this.isSpectator = false
      }
    })

    if (!!this.profileId) {
      this.profile$ = this.profileService.valueChanges(this.profileId, { uid: this.profileId }).pipe(
        tap(profile => {
          if (!!profile) {
            this.seo.generateTags({ title: `${profile.username} - Strive Journal` })
            this.profileForm.patchValue(profile)
          }
        })
      )

      this.achievingGoals$ = this.goalService.getStakeholderGoals(this.profileId, enumGoalStakeholder.achiever, !this.isOwner);
      this.supportingGoals$ = this.goalService.getStakeholderGoals(this.profileId, enumGoalStakeholder.supporter, !this.isOwner)
    }
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

  async openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  public presentProfileOptionsPopover(ev: UIEvent) {
    this.popoverCtrl.create({
      component: ProfileOptionsPage,
      event: ev
    }).then(popover => popover.present())
  }

  public async editProfileImage(profile: Profile, ev: UIEvent): Promise<void> {
    if (!this.isOwner) return

    const popover = await this.popoverCtrl.create({
      component: EditProfileImagePopoverPage,
      componentProps: { storagePath: profile.photoURL },
      event: ev
    })
    popover.onDidDismiss().then((imageURL => {
      if (imageURL && imageURL.data) {
        this.profileForm.photoURL.setValue(imageURL.data.toString())
      }
    }))
    popover.present()
  }

  public updateUsername(){
    if (this.profileForm.enabled) {
      const username = this.profileForm.username.value as string
      if (!username) return
  
      this.user.upsertProfile({ username })
    }

    this.profileForm.disabled ? this.profileForm.enable() : this.profileForm.disable()
  }

  async toggleSpectate() {
    if (this.user.uid) {
      this.userSpectateService.toggleSpectate(this.profileId)
    } else {
      this.openAuthModal()
    }
  }

  async openExercise(enumExercise: enumExercises) {
    if (!this.isOwner) return

    let component
    switch (enumExercise) {
      case enumExercises.affirmations:
        component = AffirmationUpsertComponent
        break
      
      case enumExercises.bucketlist:
        component = BucketListUpsertComponent
        break
      
      case enumExercises.dear_future_self:
        component = DearFutureSelfUpsertComponent
        break

      case enumExercises.daily_gratefulness:
        component = DailyGratefulnessUpsertComponent
        break

      case enumExercises.assess_life:
        component = AssessLifeUpsertComponent
        break
    }

    this.modalCtrl.create({ component }).then(modal => modal.present())
  }

  openFollowers() {
    this.modalCtrl.create({ component: FollowersComponent }).then(modal => modal.present())
  }

  openFollowing() {
    this.modalCtrl.create({ component: FollowingComponent }).then(modal => modal.present())
  }
}

enum enumExercises {
  affirmations,
  bucketlist,
  dear_future_self,
  daily_gratefulness,
  assess_life
}