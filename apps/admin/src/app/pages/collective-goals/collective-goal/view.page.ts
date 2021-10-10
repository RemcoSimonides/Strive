import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'strive-goal-view',
  templateUrl: './view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectiveGoalViewPage {
  segmentChoice: 'collectiveGoal' | 'team' | 'templates' = 'collectiveGoal'

  id$ = this.route.params.pipe(map(params => params.id))

  constructor(private route: ActivatedRoute) {}

  segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
  }
}
