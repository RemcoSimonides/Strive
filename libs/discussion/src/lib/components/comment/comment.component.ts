import { Component, Input } from '@angular/core';
import { Comment } from '@strive/discussion/+state/comment.firestore';

@Component({
  selector: 'discussion-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {

  @Input() goalId: string
  @Input() notificationId: string
  @Input() comment: Comment

  _reply: string

}
