import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PopoverController, ModalController } from '@ionic/angular'
import { Share } from '@capacitor/share'
import { Clipboard }  from '@capacitor/clipboard'
import { captureException } from '@sentry/angular'

import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { SpectatorService } from '@strive/spectator/spectator.service'
import { GoalService } from '@strive/goal/goal.service'
import { SeoService } from '@strive/utils/services/seo.service'

import { FollowingComponent } from '@strive/spectator/components/following/following.component'
import { FollowersComponent } from '@strive/spectator/components/followers/followers.component'
import { GoalOptionsComponent } from '@strive/goal/components/goal-options/goal-options.component'
import { EditProfileImagePopoverComponent } from './popovers/edit-profile-image/edit-profile-image.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { FollowGoalsModalComponent } from './modals/follow-goals/follow-goals.component'
import { CopiedPopoverComponent } from '@strive/ui/copied/copied.component'

import { Goal, GoalStakeholder, User, createSpectator } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { SupportingComponent } from '@strive/goal/modals/supporting/supporting.component'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'
import { getImgIxResourceUrl } from '@strive/media/directives/imgix-helpers'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'journal-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePageComponent {
  isNotMobile$ = this.screensize.isNotMobile$

  private profileId$: Observable<string | undefined> = combineLatest([
    this.route.params.pipe(map(params => params['id'])),
    this.auth.profile$
  ]).pipe(
    map(([profileId, user]) => profileId ? profileId : user?.uid),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  profile$ = this.profileId$.pipe(
    switchMap(profileId => profileId ? this.profileService.valueChanges(profileId) : of(undefined)),
    tap(() => this.loading$.next(false)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  isOwner$ = combineLatest([
    this.auth.user$,
    this.profileId$
  ]).pipe(
    map(([user, profileId]) => user?.uid === profileId),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  isSpectator$ = combineLatest([
    this.auth.user$,
    this.profileId$
  ]).pipe(
    switchMap(([user, profileId]) => user?.uid && profileId ? this.spectatorService.valueChanges(user.uid, { uid: profileId }) : of(createSpectator())),
    map(spectator => spectator?.isSpectator ?? false)
  )

  achievingStakeholders$ = combineLatest([
    this.isOwner$,
    this.profileId$
  ]).pipe(
    switchMap(([isOwner, profileId]) => {
      if (!profileId) return of([])
      return this.goalService.getStakeholderGoals(profileId, 'isAchiever', !isOwner)
    })
  )

  supportingGoals$ = combineLatest([
    this.isOwner$,
    this.profileId$
  ]).pipe(
    switchMap(([isOwner, profileId]) => profileId ? this.goalService.getStakeholderGoals(profileId, 'isSupporter', !isOwner) : of([])),
    map(stakeholders => stakeholders.map(stakeholder => stakeholder.goal))
  )

  title$ = combineLatest([
    this.profile$,
    this.isOwner$
  ]).pipe(
    map(([profile, isOwner]) => {
      const title = (isOwner || !profile) ? 'Your Profile' : profile.username
      const description = profile?.username
        ? `${profile.username} is journaling about their goals on Strive Journal. Follow ${profile.username} to stay up-to-date about the progress and help out wherever you can because together we achieve more`
        : ''

      this.seo.generateTags({
        title: `${title} - Strive Journal`,
        description,
        image: profile?.photoURL ? getImgIxResourceUrl(profile.photoURL) : undefined
      })
      return title
    })
  )

  loading$ = new BehaviorSubject<boolean>(true)

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private screensize: ScreensizeService,
    private seo: SeoService,
    private spectatorService: SpectatorService
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
        event: ev,
        alignment: 'center',
        cssClass: 'wide-popover'
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
      component: GoalCreateModalComponent
    }).then(modal => {
      modal.onDidDismiss().then((data) => {
        const navToGoal = data.data?.['navToGoal']
        if (navToGoal) this.router.navigate(['/goal', navToGoal ])
      })
      modal.present()
    })
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

  async toggleSpectate(isSpectator: boolean) {
    if (!this.auth.uid) return this.openAuthModal()

    const profile = await firstValueFrom(this.profile$)
    if (!profile) return
    const { uid, username } = profile

    this.spectatorService.upsert({
      uid: this.auth.uid,
      profileId: uid,
      isSpectator
    }, { params: { uid }})

    if (!isSpectator) return
    const achievingStakeholders = await firstValueFrom(this.achievingStakeholders$)
    if (achievingStakeholders.length === 0) return

    const goals = achievingStakeholders.map(stakeholder => stakeholder.goal)

    this.modalCtrl.create({
      component: FollowGoalsModalComponent,
      componentProps: { goals, username }
    }).then(modal => modal.present())
  }

  openFollowers() {
    this.modalCtrl.create({ component: FollowersComponent }).then(modal => modal.present())
  }

  openFollowing() {
    this.modalCtrl.create({ component: FollowingComponent }).then(modal => modal.present())
  }

  async openSupporting() {
    const goals = await firstValueFrom(this.supportingGoals$)
    if (goals.length === 0) return
    this.modalCtrl.create({
      component: SupportingComponent,
      componentProps: { goals }
    }).then(modal => modal.present())
  }

  async openShare(event: Event) {
    const profile = await firstValueFrom(this.profile$)
    if (!profile) return

    const url = `https://strivejournal.com/profile/${profile.uid}`
    const canShare = await Share.canShare()
    if (canShare) {
      Share.share({
        title: profile.username,
        text: `Check out ${profile.username}'s profile on Strive Journal`,
        url,
      }).catch(err => {
        captureException(err)
      })
    } else {
      Clipboard.write({ string: url })

      this.popoverCtrl.create({
        component: CopiedPopoverComponent,
        componentProps: { content: 'Link copied!' },
        event,
        showBackdrop: false,
        cssClass: 'copied-popover'
      }).then(popover => {
        popover.present()
        delay(1000).then(() => popover.dismiss())
      })
    }
  }
}

