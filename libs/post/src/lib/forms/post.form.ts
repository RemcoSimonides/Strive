import { FormControl } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createPost, Post } from "../+state/post.firestore";
import { UserLinkForm } from '@strive/user/user/forms/user.form';
import { GoalLinkForm } from '@strive/goal/goal/forms/goal.form';
import { MilestoneLinkForm } from '@strive/milestone/forms/milestone.form';

function createPostFormControl(params?: Post) {
  const post = createPost(params);
  return {
    isEvidence: new FormControl(post.isEvidence),
    content: new FormEntity<{ title: FormControl, description: FormControl, mediaURL: FormControl }>({
      title: new FormControl(post.content.title),
      description: new FormControl(post.content.description),
      mediaURL: new FormControl(post.content.mediaURL)
    }),
    author: new UserLinkForm(post.author),
    goal: new GoalLinkForm(post.goal),
    milestone: new MilestoneLinkForm(post.milestone)
  }
}

export type PostFormControl = ReturnType<typeof createPostFormControl>

export class PostForm extends FormEntity<PostFormControl> {
  constructor(post?: Post) {
    super(createPostFormControl(post))
  }
}
