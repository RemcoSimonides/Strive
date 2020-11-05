import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
// Capacitor
import { Plugins } from '@capacitor/core';
// Strive
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { ChatModalPage } from '@strive/chat/components/chat-modal/chat-modal.component';
import { GoalOptionsPopoverPage, enumGoalOptions } from '../popovers/options/options.component';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { AddSupportModalPage } from '../modals/add-support-modal/add-support-modal.page';
import { CreateGoalPage } from '../modals/create-goal/create-goal.page';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { GoalSharePopoverPage } from '../popovers/share/share.component';
import { InviteTokenService } from '../../../services/invite-token/invite-token.service';

const { Share } = Plugins;

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalPage implements OnInit, OnDestroy {

  private goalId: string
  goal$: Observable<Goal>

  stakeholders$: Observable<GoalStakeholder[]>
  stakeholder$: Observable<GoalStakeholder>

  isAdmin = false
  isAchiever = false
  hasOpenRequestToJoin = false

  private sub: Subscription

  constructor(
    private alertCtrl: AlertController,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private stakeholder: GoalStakeholderService,
    public user: UserService
  ) { }

  ngOnInit() { 
    this.goalId = this.route.snapshot.paramMap.get('id')
    this.goal$ = this.goalService.getGoalDocObs(this.goalId)
    this.stakeholders$ = this.stakeholder.getStakeholders$(this.goalId);
    
    this.sub = this.stakeholder.getStakeholder$(this.user.uid, this.goalId).subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin ?? false
      this.isAchiever = stakeholder.isAchiever ?? false
      this.hasOpenRequestToJoin = stakeholder.hasOpenRequestToJoin ?? false
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  public async openDiscussion(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChatModalPage,
      componentProps: {
        discussionId: this.goalId
      }
    })
    await modal.present()
  }

  public async presentGoalOptionsPopover(ev: UIEvent, goal: Goal): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
        isFinished: goal.isFinished
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
          this.finishGoal(goal.title)
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })
  }

  public async duplicateGoal(): Promise<void> {

    const loading = await this.loadingCtrl.create({
      message: `Duplicating goal`,
      spinner: 'lines'
    })
    await loading.present()

    // TODO rework this function. Is probably more efficient to have a back-end function and wait for it to complete 

    // const goal = await this.goalService.getGoal(this.goalId)

    // // Creating goal
    // const goalId = await this.goalService.duplicateGoal(goal)

    // // Creating stakeholder
    // await this.stakeholder.upsert(this.user.uid, goalId, {
    //   isAdmin: true,
    //   isAchiever: true
    // })

    // // Wait for stakeholder to be created before making milestones because you need admin rights for that
    // this.db.docWithId$<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${this.user.uid}`)
    //   .pipe(take(2))
    //   .subscribe(async stakeholder => {
    //     if (stakeholder) {
    //       if (stakeholder.isAdmin) {
    //         this.roadmapService.duplicateMilestones(goalId, goal.milestoneTemplateObject)
    //         await loading.dismiss()
    //         this.navCtrl.navigateRoot(`goal/${goalId}`)
    //       }
    //     }
    //   })
  }

  private async finishGoal(title: string): Promise<void> {

    const alert = await this.alertCtrl.create({
      header: `Awesomeness! One step closer to whatever you want to achieve in life :)`,
      subHeader: `To prevent mistakes, I have to ask whether you are sure the goal is finished. Is it?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.goalService.finishGoal(this.goalId)
            this.startPostCreation(title)
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

  private async startPostCreation(title: string) {

    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        title: title,
        achievedComponent: 'Goal'
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {
      if (data.data) {
        // refresh page here
      }
      // await this.imageService.reset()
    })

  }

  private async editGoal(goal: Goal): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CreateGoalPage,
      componentProps: {
        currentGoal: goal
      }
    })
    await modal.present()
  }

  private async deleteGoal(): Promise<void> {
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

  public requestToJoinGoal() {
    return this.stakeholder.upsert(this.user.uid, this.goalId, {
      isSpectator: true,
      hasOpenRequestToJoin: true
    })
  }

  public async openSharePopover(ev: UIEvent, goal: Goal): Promise<void> {

    if (this.platform.is('android') || this.platform.is('ios')) {

      const isPublic: boolean = goal.publicity === 'public' ? true : false
      const ref = await this.inviteTokenService.getShareLink(this.goalId, false, isPublic, this.isAdmin)

      await Share.share({
        title: goal.title,
        text: 'Check out this goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {

      const popover = await this.popoverCtrl.create({
        component: GoalSharePopoverPage,
        event: ev,
        componentProps: {
          goal: goal,
          isAdmin: this.isAdmin
        }
      })
      await popover.present()

    }
  }

  public async saveDescription(description: string): Promise<void> {
    await this.goalService.upsert(this.goalId, { description })
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
}