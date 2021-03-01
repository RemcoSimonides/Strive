import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, PopoverController, ModalController, Platform, NavController } from '@ionic/angular';
import { AngularFireFunctions } from '@angular/fire/functions';
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
import { SeoService } from '@strive/utils/services/seo.service';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { Template } from '@strive/template/+state/template.firestore'
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore'

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
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private functions: AngularFireFunctions,
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

    const useTemplateFn = this.functions.httpsCallable('useTemplate')
    const { error, result } = await useTemplateFn({ collectiveGoalId: this.collectiveGoalId, templateId: this.templateId }).toPromise()

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
}
