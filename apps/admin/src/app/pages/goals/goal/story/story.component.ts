import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GoalNotificationService } from '@strive/notification/+state/goal-notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { Observable } from 'rxjs';

@Component({
  selector: '[id] strive-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent implements OnInit {

  notifications$: Observable<Notification[]>

	@Input() id: string

  constructor(
    private notification: GoalNotificationService
  ) {}

  ngOnInit() {
    this.notifications$ = this.notification.valueChanges({ goalId: this.id })
  }

}
