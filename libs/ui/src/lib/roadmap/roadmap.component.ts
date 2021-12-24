// import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, TemplateRef } from '@angular/core';
// import { Router } from '@angular/router';

// import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore';
// import { MilestoneService } from '@strive/milestone/+state/milestone.service';
// import { MilestoneForm } from '@strive/milestone/forms/milestone.form';

// @Directive({ selector: '[milestone]' })
// export class MilestoneDirective { }

// @Component({
//   selector: 'strive-roadmap',
//   templateUrl: 'roadmap.component.html',
//   styleUrls: ['./roadmap.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class RoadmapComponent {

//   @Input() milestones: Milestone[]
//   @Input() isAdmin: boolean
//   @Input() maxdeadline: string
//   @Input() goalId: string

//   @ContentChild(MilestoneDirective, { read: TemplateRef }) milestoneTemplate: MilestoneDirective

//   private milestoneForm = new MilestoneForm()

//   constructor(
//     private milestoneService: MilestoneService,
//     private router: Router
//   ) { }

//   add() {
//     const milestone = createMilestone(this.milestoneForm.value)
//     this.milestoneService.add(milestone, { params: { goalId: this.goalId }})
//     this.milestoneForm.reset(createMilestone())
//   }

//   // editRoadmap() {
//   //   if (!this.isAdmin) return
//   //   this.router.navigateByUrl(`${this.router.url}/edit`)
//   // }

// }