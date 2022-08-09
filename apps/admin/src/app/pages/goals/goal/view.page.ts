import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'strive-goal-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalViewPage {
  segmentChoice: 'goal' | 'roadmap' | 'team' | 'story' = 'goal'

  id$ = this.route.params.pipe(map(params => params['id']))

  constructor(private route: ActivatedRoute) {}

  segmentChanged(ev: any) {
    this.segmentChoice = ev.detail.value
  }
}
