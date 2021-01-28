import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, PopoverController, ModalController, Platform, NavController } from '@ionic/angular';
// Rxjs
import { Observable, empty, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
// Pages / Popover / Modal
import { TemplateOptionsPopoverPage, enumTemplateOptions } from './popovers/template-options-popover/template-options-popover.page';
import { CreateTemplateModalPage } from './modals/create-template-modal/create-template-modal.page';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { TemplateService } from '@strive/template/+state/template.service';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { ITemplate } from '@strive/interfaces';
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: 'app-template',
  templateUrl: './template.page.html',
  styleUrls: ['./template.page.scss'],
})
export class TemplatePage implements OnInit {
  private _backBtnSubscription: Subscription
  
  public _collectiveGoalId: string
  private _collectiveGoal: ICollectiveGoal
  public _templateId: string
  public _templateDocObs: Observable<ITemplate>
  public _structuredMilestones: MilestonesLeveled[] = []

  public _isAdmin: boolean = false

  constructor(
    public user: UserService,
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private goalService: GoalService,
    private goalStakeholderService: GoalStakeholderService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private popoverCtrl: PopoverController,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private _seo: SeoService,
    private templateService: TemplateService
  ) { }

  async ngOnInit() {

    //Get collective goal id from URL
    this._collectiveGoalId = this.route.snapshot.paramMap.get('id')
    this._templateId = this.route.snapshot.paramMap.get('templateId')

    this._collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    this._templateDocObs = this.templateService.getTemplateDocObs(this._collectiveGoalId, this._templateId)
    this._templateDocObs.subscribe(template => {
      if (template) {
        if (!template.title) {
          this.initNoAccess()
          return
        }

        this._structuredMilestones = this.roadmapService.structureMilestones(template.milestoneTemplateObject)

        this._seo.generateTags({ title: `${template.title} - Strive Journal` })
      }
    })

    //Get current users' rights
    this.user.profile$.pipe(
      switchMap(userProfile => {
        if (userProfile) {
          return this.collectiveGoalStakeholderService.getStakeholderDocObs(userProfile.id, this._collectiveGoalId)
        } else {
          this._isAdmin = false

          // if collective goal is private, then no access anymore to template
          if (!this._collectiveGoal.isPublic) {
            this.initNoAccess()
          }

          return empty()
        }
      })
    ).subscribe(stakeholder => {

      this._isAdmin = stakeholder.isAdmin

    })

  }

  private async initNoAccess(): Promise<void> {
    this.router.navigate(['/explore'])
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

  public async useTemplate(): Promise<void> {

    if (!this.user.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalPage,
        componentProps: {
          authSegment: enumAuthSegment.register
        }
      })
      await modal.present()
      return
    }

    const loading = await this.loadingCtrl.create({
      message: `Creating goal...`,
      spinner: `lines`
    })
    await loading.present()

    const template: ITemplate = await this.templateService.getTemplate(this._collectiveGoalId, this._templateId)
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    let publicity: GoalPublicityType
    if (collectiveGoal.isPublic && template.goalIsPublic) {
      // public
      publicity = 'public'
    } else if (!collectiveGoal.isPublic && template.goalIsPublic) {
      // semi public
      publicity = 'collectiveGoalOnly'
    } else {
      publicity = 'private'
    }

    // Create goal
    const goalId = await this.goalService.create(this.user.uid, {
      title: template.goalTitle,
      description: template.description,
      publicity: publicity,
      deadline: template.goalDeadline,
      shortDescription: template.goalShortDescription || '',
      image: template.goalImage,
      collectiveGoalId: this._collectiveGoalId
    })

    // Create stakeholder
    this.goalStakeholderService.upsert(this.user.uid, goalId, {
      isAdmin: true,
      isAchiever: true
    })

    // Wait for stakeholder to be created before making milestones because you need admin rights for that
    this.db.docWithId$<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${this.user.uid}`)
      .pipe(take(2))
      .subscribe(async stakeholder => {
        if (stakeholder) {
          if (stakeholder.isAdmin) {

            // Generate milestones
            this.roadmapService.duplicateMilestones(goalId, template.milestoneTemplateObject)
            await loading.dismiss()

            // Increase numberOfTimesUsed
            this.templateService.increaseTimesUsed(this._collectiveGoalId, this._templateId, template.numberOfTimesUsed)

            this.router.navigateByUrl(`goal/${goalId}`)
          }
        }
      })

  }

  public async presentTemplateOptionsPopover(ev: UIEvent): Promise<void> {

    const popover = await this.popoverCtrl.create({
      component: TemplateOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this._isAdmin
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumTemplateOptions.editTemplate:
          this.editTemplate()
          break
        case enumTemplateOptions.editRoadmap:
          this.editMilestones()
          break
      }
    })

  }

  public async editTemplate(): Promise<void> {
    const template: ITemplate = await this.templateService.getTemplate(this._collectiveGoalId, this._templateId)

    const modal = await this.modalCtrl.create({
      component: CreateTemplateModalPage,
      componentProps: {
        collectiveGoalId: this._collectiveGoalId,
        currentTemplate: template
      }
    })
    await modal.present()

  }

  public async _saveDescription(description: string): Promise<void> {

    await this.db.upsert(`CollectiveGoals/${this._collectiveGoalId}/Templates/${this._templateId}`, {
      description: description
    })

  }

  public async editMilestones(): Promise<void> {

    await this.router.navigateByUrl(`${this.router.url}/edit`)

  }


}
