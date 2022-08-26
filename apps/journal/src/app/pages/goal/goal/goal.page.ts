import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'
// Sentry
import { captureException } from '@sentry/capacitor'
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
import { UserService } from '@strive/user/user/user.service'
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
// Strive Interfaces
import { Goal, GoalStakeholder, Milestone, StoryItem } from '@strive/model'
import { TeamModalComponent } from '@strive/goal/stakeholder/modals/team/team.modal'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { SeoService } from '@strive/utils/services/seo.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { SupportService } from '@strive/support/support.service'

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent {

  private _goal!: Goal
  get goal() { return this._goal }
  @Input() set goal(goal: Goal) {
    this._goal = goal

    this.milestones$ = this.milestone.valueChanges([orderBy('order', 'asc')], { goalId: goal.id }).pipe(
      joinWith({
        supports: milestone => this.user.user$.pipe(
          switchMap(user => {
            if (!user) return of([])
            const recipientQuery = [
              where('source.milestone.id', '==', milestone.id),
              where('source.recipient.uid', '==', user.uid)
            ]
            const supporterQuery = [
              where('source.milestone.id', '==', milestone.id),
              where('source.supporter.uid', '==', user.uid)
            ]
            return combineLatest([
              this.supportService.valueChanges(recipientQuery, { goalId: this.goal.id }),
              this.supportService.valueChanges(supporterQuery, { goalId: this.goal.id }),
            ]).pipe(
              map(([ recipientSupports, supporterSupports ]) => {
                const supports = [ ...recipientSupports, ...supporterSupports]
                return supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)
              })
            )
          })
        )
      }, { shouldAwait: false })
    )
  }

  private _stakeholder!: GoalStakeholder
  get stakeholder() { return this._stakeholder }
  @Input() set stakeholder(stakeholder: GoalStakeholder) {
    this._stakeholder = stakeholder
    
    if (stakeholder.isAdmin) {
      this.openRequests$ = this.stakeholderService.valueChanges([where('hasOpenRequestToJoin', '==', true)], { goalId: stakeholder.goalId })
    }
  }

  maxStoryItems = 10
  private _story: StoryItem[] = []
  get story() { return this._story }
  @Input() set story(story: StoryItem[]) {
    if (!story) return
    this._story = story.splice(0, this.maxStoryItems)
  }

  milestones$?: Observable<Milestone[]>
  openRequests$?: Observable<GoalStakeholder[]>

  @Output() segmentChange = new EventEmitter<'goal' | 'roadmap' | 'story'>()

  constructor(
    private alertCtrl: AlertController,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private milestone: MilestoneService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService,
    private user: UserService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {}

  async presentGoalOptionsPopover(ev: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverComponent,
      event: ev,
      componentProps: {
        isAdmin: this.stakeholder.isAdmin,
        status: goal.status
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
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

  updateStatus($event: any, goal: Goal) {
    if (!this.stakeholder.isAchiever) return;

    const status = $event.detail.value;
    if (status === goal.status) return
    if (status === 'finished') {
      this.alertCtrl.create({
        header: `Awesomeness! One step closer to whatever you want to achieve in life :)`,
        subHeader: `To prevent mistakes, I have to ask whether you are sure the goal is finished. Is it?`,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              goal.status = status
              if (!this.user.uid) return
              this.stakeholderService.update(this.user.uid, { status }, { params: { goalId: this.goal.id }})
              this.startPostCreation()
            }
          },
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              $event.target.value = goal.status;
            }
          }
        ]
      }).then(alert => alert.present())
    } else {
      goal.status = status
      if (!this.user.uid) return
      this.stakeholderService.update(this.user.uid, { status }, { params: { goalId: this.goal.id }})
    }

  }

  updatePrivacy($event: any, goal: Goal) {
    if (!this.stakeholder.isAdmin) return;
    const publicity = $event.detail.value
    if (publicity === goal.publicity) return
    this.goalService.update({ id: this.goal.id, publicity })
  }

  private startPostCreation() {
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        goalId: this.goal.id,
        postId: this.goal.id
      }
    }).then(modal => modal.present())
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: {
        currentGoal: goal
      }
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
    if (!this.user.uid) {
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

  getJoinText() {
    if (this.stakeholder.isAchiever) return 'JOINED'
    if (this.stakeholder.isAdmin) return 'JOIN'
    if (this.stakeholder.hasOpenRequestToJoin) return 'CANCEL REQUEST'
    return 'REQUEST JOIN'
  }

  async join() {
    if (!this.user.uid) {
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
          uid: this.user.uid,
          isAchiever: true
        }, { params: { goalId: this.goal.id }})
      } else {
        return this.stakeholderService.upsert({
          uid: this.user.uid,
          isSpectator: true,
          hasOpenRequestToJoin: true
        }, { params: { goalId: this.goal.id }})
      }
    }

    if (hasOpenRequestToJoin) {
      return this.stakeholderService.upsert({
        uid: this.user.uid,
        isSpectator: true,
        hasOpenRequestToJoin: false
      }, { params: { goalId: this.goal.id }})
    }
    
    this.openTeamModal()
  }

  openTeamModal() {
    this.modalCtrl.create({
      component: TeamModalComponent,
      componentProps: { goalId: this.goal.id }
    }).then(modal => modal.present())
  }

  async openSharePopover(ev: UIEvent, goal: Goal) {
    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goal.id, isSecret, this.stakeholder.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      Share.share({
        title: goal.title,
        text: 'Check out this goal',
        url,
        dialogTitle: 'Together we achieve!'
      }).catch(err => {
        captureException(err)
      })
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