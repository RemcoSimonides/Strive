import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { RefresherCustomEvent } from '@ionic/angular'
import { delay } from '@strive/utils/helpers'
import { createGoalStakeholder, StoryItem } from '@strive/model'

@Component({
  selector: '[story][goalId] journal-goal-story',
  templateUrl: 'story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {
  @Input() story: StoryItem[] = []
  @Input() stakeholder = createGoalStakeholder()
  @Input() goalId = ''

  async refresh($event: RefresherCustomEvent) {
    await delay(500)
    $event?.target.complete()
  }
}