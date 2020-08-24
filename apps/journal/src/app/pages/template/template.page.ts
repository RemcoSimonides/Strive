import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, PopoverController, ModalController, Platform, NavController } from '@ionic/angular';
// Rxjs
import { Observable, empty, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
// Pages / Popover / Modal
import { TemplateOptionsPopoverPage, enumTemplateOptions } from './popovers/template-options-popover/template-options-popover.page';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { CollectiveGoalStakeholderService } from 'apps/journal/src/app/services/collective-goal/collective-goal-stakeholder.service';
import { TemplateService } from 'apps/journal/src/app/services/template/template.service';
import { RoadmapService } from 'apps/journal/src/app/services/roadmap/roadmap.service';
import { GoalService } from 'apps/journal/src/app/services/goal/goal.service';
import { CollectiveGoalService } from 'apps/journal/src/app/services/collective-goal/collective-goal.service';
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';
// Interfaces
import { ITemplate } from 'apps/journal/src/app/interfaces/template.interface';
import { IMilestonesLeveled } from 'apps/journal/src/app/interfaces/milestone.interface';
import { ICollectiveGoal } from 'apps/journal/src/app/interfaces/collective-goal.interface';
import { CreateTemplateModalPage } from './modals/create-template-modal/create-template-modal.page';
import { enumGoalPublicity } from 'apps/journal/src/app/interfaces/goal.interface';
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { IGoalStakeholder } from 'apps/journal/src/app/interfaces/goal-stakeholder.interface';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';

@Component({
  selector: 'app-template',
  templateUrl: './template.page.html',
  styleUrls: ['./template.page.scss'],
})
export class TemplatePage implements OnInit {
  public _isLoggedIn: boolean
  private _backBtnSubscription: Subscription
  
  public _collectiveGoalId: string
  private _collectiveGoal: ICollectiveGoal
  public _templateId: string
  public _templateDocObs: Observable<ITemplate>
  public _structuredMilestones: IMilestonesLeveled[] = []

  public _isAdmin: boolean = false

  constructor(
    private authService: AuthService,
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

        this._seo.generateTags({
          title: `${template.title} - Strive Journal`
        })
      }
    })

    //Get current users' rights
    this.authService.userProfile$.pipe(
      switchMap(userProfile => {
        if (userProfile) {
          this._isLoggedIn = true
          return this.collectiveGoalStakeholderService.getStakeholderDocObs(userProfile.id, this._collectiveGoalId)
        } else {
          this._isAdmin = false
          this._isLoggedIn = false

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

    if (!this._isLoggedIn) {
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

    const uid: string = (await this.authService.afAuth.currentUser).uid
    const template: ITemplate = await this.templateService.getTemplate(this._collectiveGoalId, this._templateId)
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    let publicity: enumGoalPublicity
    if (collectiveGoal.isPublic && template.goalIsPublic) {
      // public
      publicity = enumGoalPublicity.public
    } else if (!collectiveGoal.isPublic && template.goalIsPublic) {
      // semi public
      publicity = enumGoalPublicity.collectiveGoalOnly
    } else {
      publicity = enumGoalPublicity.private
    }

    // Create goal
    const goalId = await this.goalService.handleCreatingGoal(uid, {
      title: template.goalTitle,
      description: template.description,
      publicity: publicity,
      deadline: template.goalDeadline,
      shortDescription: template.goalShortDescription || '',
      image: template.goalImage
    }, {
      id: this._collectiveGoalId,
      title: collectiveGoal.title,
      isPublic: collectiveGoal.isPublic,
      image: collectiveGoal.image
    })

    // Create stakeholder
    this.goalStakeholderService.upsert(uid, goalId, {
      isAdmin: true,
      isAchiever: true
    })

    // Wait for stakeholder to be created before making milestones because you need admin rights for that
    this.db.docWithId$<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)
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
