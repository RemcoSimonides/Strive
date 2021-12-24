// import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { LoadingController } from '@ionic/angular';
// import { GoalService } from '@strive/goal/goal/+state/goal.service';
// import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore';
// import { SeoService } from '@strive/utils/services/seo.service';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { TemplateService } from '@strive/template/+state/template.service';

// @Component({
//   selector: 'journal-edit-roadmap',
//   templateUrl: './edit-roadmap.page.html',
//   styleUrls: ['./edit-roadmap.page.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class EditRoadmapPage implements OnInit {

//   private collectiveGoalId: string;
//   private templateId: string;

//   mode: 'create' | 'update'
//   roadmap$: Observable<MilestoneTemplate[]>

//   constructor(
//     private goal: GoalService,
//     private loadingCtrl: LoadingController,
//     private route: ActivatedRoute,
//     private router: Router,
//     private seo: SeoService,
//     private template: TemplateService
//   ) {
//     const extras = this.router.getCurrentNavigation()
//     this.mode = extras?.extras.state?.mode ? 'create' : 'update'

//     this.collectiveGoalId = this.route.snapshot.paramMap.get('id')
//     this.templateId = this.route.snapshot.paramMap.get('templateId')

//     // this.roadmap$ = this.template.valueChanges(this.templateId, { collectiveGoalId: this.collectiveGoalId }).pipe(
//     //   map(template => template.roadmapTemplate)
//     // )
//   }

//   ngOnInit() {
//     const tag = this.mode === 'create' ? 'Create' : 'Edit'
//     this.seo.generateTags({ title: `${tag} Template Roadmap - Strive Journal` })
//   }

//   async save(roadmapTemplate: MilestoneTemplate[]) {
//     const loading = await this.loadingCtrl.create({ spinner: 'lines' })
//     loading.present()

//     // Save milestone object
//     await this.template.update(this.templateId, { roadmapTemplate }, { params: { collectiveGoalId: this.collectiveGoalId }})

//     loading.dismiss()
//     this.router.navigateByUrl(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)
//   }

//   cancel() {
//     this.router.navigateByUrl(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)
//   }
// }