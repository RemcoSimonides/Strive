import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';

declare const initMilestonesAnimation: Function;

@Directive({ selector: '[milestone]' })
export class MilestoneDirective { }

@Component({
  selector: 'strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  private _structuredMilestones: MilestonesLeveled[]
  get structuredMilestones() { return this._structuredMilestones }
  @Input() set structuredMilestones(value: MilestonesLeveled[]) {
    this._structuredMilestones = value;
    initMilestonesAnimation();
  }
  @Input() isAdmin: boolean
  @Input() maxdeadline: string

  @ContentChild(MilestoneDirective, { read: TemplateRef }) milestoneTemplate: MilestoneDirective;

  constructor(
    private loadingCtrl: LoadingController,
    private router: Router,
    public roadmapService: RoadmapService
  ) { }

  editRoadmap() {
    if (!this.isAdmin) return
    this.router.navigateByUrl(`${this.router.url}/edit`)
  }

}