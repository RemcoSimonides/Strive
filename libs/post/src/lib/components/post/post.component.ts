import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Post, StoryItem, UserLink } from '@strive/model'
import { PostService } from '@strive/post/post.service';
import { Observable } from 'rxjs';

@Component({
  selector: '[storyItem] post-main',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {

  @Input() storyItem: StoryItem
  author: UserLink

  post$: Observable<Post>
  
  constructor(private post: PostService) {}

  ngOnInit() {
    const { postId, user, goal } = this.storyItem.source
    this.author = user
    this.post$ = this.post.valueChanges(postId, { goalId: goal.id })
  }

}
