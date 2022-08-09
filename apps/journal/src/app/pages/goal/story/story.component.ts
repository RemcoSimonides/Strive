import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { delay } from '@strive/utils/helpers';

import { Goal, StoryItem } from '@strive/model'
import { StoryService } from '@strive/goal/story/story.service';

@Component({
  selector: '[goal] journal-goal-story',
  templateUrl: 'story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent implements OnInit {
  story$?: Observable<StoryItem[]>

  @Input() goal!: Goal

  constructor(private story: StoryService) {}

  ngOnInit() {
    const query = [orderBy('date', 'desc')]
    this.story$ = this.story.valueChanges(query, { goalId: this.goal.id })
  }

  async refreshPosts($event: any) {
    await delay(500)
    $event?.target.complete()
  }

  trackByFn(_: number, item: StoryItem) {
    return item?.id
  }
}