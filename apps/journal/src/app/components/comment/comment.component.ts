import { Component, OnInit, Input } from '@angular/core';
import { IComment, enumCommentType } from '@strive/interfaces';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {

  @Input() goalId: string
  @Input() notificationId: string
  @Input() comment: IComment

  _reply: string
  enumCommentType = enumCommentType;

  constructor(
  ) { }

  ngOnInit() {}

}
