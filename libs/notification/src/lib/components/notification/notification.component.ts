import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform } from '@angular/core';

// Strive
import { Notification } from '@strive/notification/+state/notification.firestore';


@Pipe({ name: 'source' })
export class SourcePipe implements PipeTransform {
  transform(link: string): 'user' | 'goal' {
    if (link.includes('profile')) return 'user'
    return 'goal'
  }
}

@Component({
  selector: '[notification][reference][isAdmin] notification-main',
  templateUrl: 'notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {

  @Input() goalId: string
  @Input() notification: Notification
  @Input() isAdmin: boolean
  @Input() reference: string

}