import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore';

declare const initMilestonesAnimation: Function;

@Directive({ selector: '[milestone]' })
export class MilestoneDirective { }

@Component({
  selector: 'strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  @ContentChild(MilestoneDirective, { read: TemplateRef }) milestoneTemplate: MilestoneDirective;

  @Input() structuredMilestones: MilestonesLeveled[]
  @Input() isAdmin: boolean
  @Input() maxdeadline: string

  constructor(
    private loadingCtrl: LoadingController,
    private router: Router
  ) { }

  ngOnInit() {
    initMilestonesAnimation()
  }

  editRoadmap() {
    if (!this.isAdmin) return
    this.loadingCtrl.create({ spinner: 'lines' }).then(loading => loading.present())
    this.router.navigateByUrl(`${this.router.url}/edit`)
  }

  getContext(milestone: any, maxDeadline: string, index: string[]) {
    return { $implicit: { ...milestone, maxDeadline, index }}
  }
}