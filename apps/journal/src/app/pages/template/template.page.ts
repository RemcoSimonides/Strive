import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, PopoverController, ModalController, Platform, NavController } from '@ionic/angular';
// Rxjs
import { Observable, Subscription, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
// Pages / Popover / Modal
import { TemplateOptionsPopoverPage } from './popovers/template-options-popover/template-options-popover.page';
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
import { Template } from '@strive/template/+state/template.firestore'
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: 'app-template',
  templateUrl: './template.page.html',
  styleUrls: ['./template.page.scss'],
})
export class TemplatePage implements OnInit {
  private backBtnSubscription: Subscription
  
  public collectiveGoalId: string
  
  public templateId: string
  public template$: Observable<Template>
  public structuredMilestones: MilestonesLeveled[] = []

  public isAdmin: Observable<boolean>

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
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private templateService: TemplateService
  ) { }

  ngOnInit() {
    this.collectiveGoalId = this.route.snapshot.paramMap.get('id')
    this.templateId = this.route.snapshot.paramMap.get('templateId')

    this.template$ = this.templateService.getTemplate$(this.collectiveGoalId, this.templateId).pipe(
      tap(template => {
        this.structuredMilestones = this.roadmapService.structureMilestones(template.milestoneTemplateObject)
        this.seo.generateTags({ title: `${template.title} - Strive Journal` })
      })
    )

    this.isAdmin = this.user.profile$.pipe(
      switchMap(userProfile => {
        if (!!userProfile) {
          return this.collectiveGoalStakeholderService.getStakeholder$(userProfile.id, this.collectiveGoalId).pipe(map(stakeholder => !!stakeholder && stakeholder.isAdmin))
        } else {
          return of(false)
        }
      })
    )

  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  public async useTemplate() {
    if (!this.user.uid) {
      this.modalCtrl.create({
        component: AuthModalPage,
        componentProps: {
          authSegment: enumAuthSegment.register
        }
      }).then(modal => modal.present())
      return
    }

    const loading = await this.loadingCtrl.create({
      message: `Creating goal...`,
      spinner: `lines`
    })
    loading.present();


    // TODO extract to http callable function
    const template = await this.templateService.getTemplate(this.collectiveGoalId, this.templateId)
    const collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)

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
      collectiveGoalId: this.collectiveGoalId
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
        if (!!stakeholder && stakeholder.isAdmin) {
          // Generate milestones
          this.roadmapService.duplicateMilestones(goalId, template.milestoneTemplateObject)
          await loading.dismiss()

          // Increase numberOfTimesUsed
          this.templateService.increaseTimesUsed(this.collectiveGoalId, this.templateId, template.numberOfTimesUsed)

          this.router.navigateByUrl(`goal/${goalId}`)
        }
      })
  }

  public presentTemplateOptionsPopover(ev: UIEvent) {
    this.popoverCtrl.create({
      component: TemplateOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
        collectiveGoalId: this.collectiveGoalId,
        templateId: this.templateId
      }
    }).then(popover => popover.present())
  }


  public saveDescription(description: string) {
    this.db.upsert(`CollectiveGoals/${this.collectiveGoalId}/Templates/${this.templateId}`, { description })
  }
}
