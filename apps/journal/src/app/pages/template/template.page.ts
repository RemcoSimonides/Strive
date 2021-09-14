import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, PopoverController, ModalController, Platform, NavController } from '@ionic/angular';
import { Functions, httpsCallable } from '@angular/fire/functions';
// Rxjs
import { Observable, Subscription, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
// Pages / Popover / Modal
import { TemplateOptionsPopoverPage } from './popovers/template-options-popover/template-options-popover.page';
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { TemplateService } from '@strive/template/+state/template.service';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { Template } from '@strive/template/+state/template.firestore'
import { Milestone, MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore'
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

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

  public maxDeadline$: Observable<string>

  public isAdmin: Observable<boolean>

  constructor(
    public user: UserService,
    private collectiveGoalService: CollectiveGoalService,
    private stakeholder: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private functions: Functions,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private template: TemplateService
  ) { }

  ngOnInit() {
    this.collectiveGoalId = this.route.snapshot.paramMap.get('id')
    this.templateId = this.route.snapshot.paramMap.get('templateId')

    this.template$ = this.template.valueChanges(this.templateId, { collectiveGoalId: this.collectiveGoalId }).pipe(
      tap(template => {
        if (!this.structuredMilestones.length) {
          this.structuredMilestones = this.roadmapService.structureMilestones(template.roadmapTemplate)
        }
        this.seo.generateTags({ title: `${template.title} - Strive Journal` })
      })
    )

    this.maxDeadline$ = this.collectiveGoalService.valueChanges(this.collectiveGoalId).pipe(
      map(collectiveGoal => collectiveGoal.deadline)
    )

    this.isAdmin = this.user.profile$.pipe(
      switchMap(userProfile => {
        if (!!userProfile) {
          return this.stakeholder.valueChanges(userProfile.id, { collectiveGoalId: this.collectiveGoalId }).pipe(map(stakeholder => !!stakeholder?.isAdmin))
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
          authSegment: enumAuthSegment.login
        }
      }).then(modal => modal.present())
      return
    }

    const loading = await this.loadingCtrl.create({
      message: `Creating goal...`,
      spinner: `lines`
    })
    loading.present();

    const useTemplateFn = httpsCallable(this.functions, 'useTemplate')
    const { error, result } = await useTemplateFn({ collectiveGoalId: this.collectiveGoalId, templateId: this.templateId }) as any

    if (!!error) {
      await loading.dismiss()
      throw new Error(result)
    }
    this.router.navigateByUrl(`goal/${result}`)
    loading.dismiss()
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

  updateRoadmap(deadline: string, context: Milestone, template: Template) {
    const milestone = template.roadmapTemplate.find(m => m.sequenceNumber === context.sequenceNumber)
    milestone.deadline = deadline

    this.template.update(this.templateId, {
      roadmapTemplate: template.roadmapTemplate
    }, { params: { collectiveGoalId: this.collectiveGoalId }})
  }
}
