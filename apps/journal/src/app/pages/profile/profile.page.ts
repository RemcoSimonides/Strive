import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
// Services
import { UserSpectateService } from '@strive/user/spectator/spectator.service';
import { UserService } from '@strive/user/user/user.service';
import { GoalService } from '@strive/goal/goal/goal.service';
import { SeoService } from '@strive/utils/services/seo.service';
// Rxjs
import { combineLatest, firstValueFrom, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';
// Modals / Popover
import { FollowingComponent } from '@strive/user/spectator/components/following/following.component';
import { FollowersComponent } from '@strive/user/spectator/components/followers/followers.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
import { EditProfileImagePopoverComponent } from './popovers/edit-profile-image/edit-profile-image.component';
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component';
// Interfaces
import { Goal, GoalStakeholder, User, createSpectator } from '@strive/model'
// Other
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';

@Component({
  selector: 'journal-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfileComponent {
  private profileId$: Observable<string | undefined> = combineLatest([
    this.route.params.pipe(pluck('id')),
    this.user.user$
  ]).pipe(
    map(([profileId, user]) => profileId ? profileId : user?.uid),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  profile$ = this.profileId$.pipe(
    switchMap(profileId => profileId ? this.user.valueChanges(profileId) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  isOwner$ = combineLatest([
    this.user.user$,
    this.profileId$
  ]).pipe(
    map(([user, profileId]) => user?.uid === profileId),
    startWith(false),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  isSpectator$ = combineLatest([
    this.user.user$,
    this.profileId$
  ]).pipe(
    switchMap(([user, profileId]) => user?.uid && profileId ? this.userSpectateService.valueChanges(user.uid, { uid: profileId }) : of(createSpectator())),
    map(spectator => spectator?.isSpectator ?? false)
  )

  achievingGoals$ = combineLatest([
    this.isOwner$,
    this.profileId$
  ]).pipe(
    switchMap(([isOwner, profileId]) => profileId ? this.goalService.getStakeholderGoals(profileId, 'isAchiever', !isOwner) : of([]))
  )

  supportingGoals$ = combineLatest([
    this.isOwner$,
    this.profileId$
  ]).pipe(
    switchMap(([isOwner, profileId]) => profileId ? this.goalService.getStakeholderGoals(profileId, 'isSupporter', !isOwner) : of([])),
    map(values => values.map(value => value.goal))
  )

  title$ = combineLatest([
    this.profile$,
    this.isOwner$
  ]).pipe(
    map(([profile, isOwner]) => {
      const title = isOwner || !profile ? 'Your Profile' : profile.username
      this.seo.generateTags({ title: `${title} - Strive Journal` })
      return title
    })
  )

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private seo: SeoService,
    private userSpectateService: UserSpectateService
  ) {}

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  async editProfileImage(profile: User, ev: UIEvent) {
    const isOwner = await firstValueFrom(this.isOwner$)
    if (!isOwner) {

      this.modalCtrl.create({
        component: ImageZoomModalComponent,
        componentProps: {
          ref: profile.photoURL,
          asset: 'profile.png'
        },
        enterAnimation: getEnterAnimation,
        leaveAnimation: getLeaveAnimation
      }).then(modal => modal.present())

    } else {
      const popover = await this.popoverCtrl.create({
        component: EditProfileImagePopoverComponent,
        componentProps: { storagePath: profile.photoURL },
        event: ev
      })
      // popover.onDidDismiss().then((imageURL => {
      //   if (imageURL && imageURL.data) {
      //     this.profileForm.photoURL.setValue(imageURL.data.toString())
      //   }
      // }))
      popover.present()
    }
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => modal.present())
  }

  openGoalOptions(goal: Goal, stakeholder: GoalStakeholder, ev: UIEvent) {
    ev.stopPropagation()
    ev.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: { goal, stakeholder },
      event: ev
    }).then(popover => popover.present())
  }

  async toggleSpectate(spectate: boolean) {
    if (this.user.uid) {
      const profileId = await firstValueFrom(this.profileId$)
      if (profileId) this.userSpectateService.toggleSpectate(profileId, spectate)
    } else {
      this.openAuthModal()
    }
  }

  openFollowers() {
    this.modalCtrl.create({ component: FollowersComponent }).then(modal => modal.present())
  }

  openFollowing() {
    this.modalCtrl.create({ component: FollowingComponent }).then(modal => modal.present())
  }
}

