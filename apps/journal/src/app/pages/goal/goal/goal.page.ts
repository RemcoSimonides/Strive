import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'
// Sentry
import { captureException, captureMessage } from '@sentry/capacitor'
// Firebase
import { orderBy, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'
// Rxjs
import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
// Capacitor
import { Share } from '@capacitor/share'
// Strive Components
import { GoalOptionsPopoverComponent, enumGoalOptions } from '../popovers/options/options.component'
import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { GoalSharePopoverComponent } from '@strive/goal/goal/components/popovers/share/share.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
// Strive Services
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

// Strive Interfaces
import { createGoal, Goal, GoalStakeholder, Milestone, StoryItem } from '@strive/model'
import { TeamModalComponent } from '@strive/goal/stakeholder/modals/team/team.modal'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { FocusModalComponent } from '@strive/goal/stakeholder/modals/upsert-focus/upsert-focus.component'

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent {

  private _goal?: Goal
  get goal() { return this._goal ?? createGoal() }
  @Input() set goal(goal: Goal) {
    this._goal = goal
  }

  private _stakeholder!: GoalStakeholder
  get stakeholder() { return this._stakeholder }
  @Input() set stakeholder(stakeholder: GoalStakeholder) {
    this._stakeholder = stakeholder
    
    if (stakeholder.isAdmin) {
      this.openRequests$ = this.stakeholderService.valueChanges([where('hasOpenRequestToJoin', '==', true)], { goalId: stakeholder.goalId })
    }
  }

  @Input() story: StoryItem[] = []

  milestones$?: Observable<Milestone[]>
  openRequests$?: Observable<GoalStakeholder[]>

  @Output() segmentChange = new EventEmitter<'goal' | 'roadmap' | 'story'>()

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private milestone: MilestoneService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.milestones$ = this.route.params.pipe(
      map(params => params['id'] as string),
      switchMap(goalId => this.milestone.valueChanges([orderBy('order', 'asc')], { goalId }).pipe(
        joinWith({
          achiever: ({ achieverId }) => achieverId ? this.profileService.valueChanges(achieverId) : undefined,
          supports: milestone => this.auth.profile$.pipe(
            switchMap(user => {
              if (!user) return of([])
              const recipientQuery = [
                where('milestoneId', '==', milestone.id),
                where('recipientId', '==', user.uid)
              ]
              const supporterQuery = [
                where('milestoneId', '==', milestone.id),
                where('supporterId', '==', user.uid)
              ]
              return combineLatest([
                this.supportService.valueChanges(recipientQuery, { goalId }),
                this.supportService.valueChanges(supporterQuery, { goalId }),
              ]).pipe(
                map(([ recipientSupports, supporterSupports ]) => {
                  const supports = [ ...recipientSupports, ...supporterSupports]
                  return supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)
                })
              )
            })
          )}, { shouldAwait: false })  
        )
      )
    )
  }

  async presentGoalOptionsPopover(event: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverComponent,
      event,
      componentProps: {
        stakeholder: this.stakeholder
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumGoalOptions.openTeamModal:
          this.openTeamModal()
          break
        case enumGoalOptions.openFocusModal:
          this.openFocusModal()
          break
        case enumGoalOptions.editNotificationSettings:
          console.warn('not supported yet')
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })
  }

  updateDescription(description: string) {
    this.goalService.update(this.goal.id, { description })
  }

  updatePrivacy($event: any, goal: Goal) {
    if (!this.stakeholder.isAdmin) return;
    const publicity = $event.detail.value
    if (publicity === goal.publicity) return
    this.goalService.update({ id: this.goal.id, publicity })
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: { goal }
    }).then(modal => modal.present())
  }

  private deleteGoal() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.goalService.remove(this.goal.id)
            this.router.navigate(['/goals'])
            this.seo.generateTags({ title: `Goals - Strive Journal` })
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
  
  async supportGoal() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.supportGoal()
      })
      return modal.present()
    }

    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goalId: this.goal.id
      }
    }).then(modal => modal.present())
  }

  async join() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.join()
      })
      return modal.present()
    }

    const { isAchiever, isAdmin, hasOpenRequestToJoin} = this.stakeholder

    if (!isAchiever && !hasOpenRequestToJoin) {
      if (isAdmin) {
        return this.stakeholderService.upsert({
          uid: this.auth.uid,
          isAchiever: true
        }, { params: { goalId: this.goal.id }})
      } else {
        return this.stakeholderService.upsert({
          uid: this.auth.uid,
          isSpectator: true,
          hasOpenRequestToJoin: true
        }, { params: { goalId: this.goal.id }})
      }
    }

    if (hasOpenRequestToJoin) {
      return this.alertCtrl.create({
        subHeader: 'Are you sure you want to cancel your request to join goal?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.stakeholderService.upsert({
                uid: this.auth.uid,
                isSpectator: true,
                hasOpenRequestToJoin: false
              }, { params: { goalId: this.goal.id }})
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      }).then(alert => alert.present())
    }

    return this.alertCtrl.create({
      subHeader: 'Are you sure you no longer want to be an achiever in this goal?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.stakeholderService.upsert({
              uid: this.auth.uid,
              isAchiever: false
            }, { params: { goalId: this.goal.id }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  async spectate() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.spectate()
      })
      return modal.present()
    }

    const { isSpectator } = this.stakeholder

    return this.stakeholderService.upsert({
      uid: this.auth.uid,
      isSpectator: !isSpectator
    }, { params: { goalId: this.goal.id }})
  }


  openTeamModal() {
    this.modalCtrl.create({
      component: TeamModalComponent,
      componentProps: { goalId: this.goal.id }
    }).then(modal => modal.present())
  }

  openFocusModal() {
    this.modalCtrl.create({
      component: FocusModalComponent,
      componentProps: {
        stakeholder: this.stakeholder
      }
    }).then(modal => modal.present())
  }

  async openSharePopover(ev: UIEvent, goal: Goal) {
    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goal.id, isSecret, this.stakeholder.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      try {
        Share.share({
          title: goal.title,
          text: 'Check out this goal',
          url,
          dialogTitle: 'Together we achieve!'
        }).catch(err => {
          captureException(err)
        })
      } catch(err: any) {
        captureMessage(err['message'])
      }
    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }

  saveDescription(description: string) {
    return this.goalService.updateDescription(this.goal.id, description)
  }

  isOverdue(deadline: string) {
    return new Date(deadline) < new Date()
  }

  handleRequestDecision(stakeholder: GoalStakeholder, isAccepted: boolean, $event: UIEvent) {
    $event.stopPropagation()
    this.stakeholderService.upsert({
      uid: stakeholder.uid,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: this.goal.id }})
  }

  navTo(uid: string) {
    this.router.navigate(['/profile/', uid])
  }

  openZoom(goal: Goal) {
    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: {
        ref: goal.image,
        asset: 'goal.png'
      },
      enterAnimation: getEnterAnimation,
      leaveAnimation: getLeaveAnimation
    }).then(modal => modal.present())
  }
}