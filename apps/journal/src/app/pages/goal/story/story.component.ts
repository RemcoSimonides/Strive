import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { orderBy } from 'firebase/firestore';

import { Observable } from 'rxjs';
import { delay } from '@strive/utils/helpers';

import { StoryItem } from '@strive/model'
import { StoryService } from '@strive/goal/story/story.service';

@Component({
  selector: '[goalId] journal-goal-story',
  templateUrl: 'story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {
  story$?: Observable<StoryItem[]>

  @Input() set goalId(goalId: string) {
    if (!goalId) return
    const query = [orderBy('date', 'desc')]
    this.story$ = this.story.valueChanges(query, { goalId })
  }

  constructor(private story: StoryService) {}


  async refreshPosts($event: any) {
    await delay(500)
    $event?.target.complete()
  }

  trackByFn(_: number, item: StoryItem) {
    return item?.id
  }
}