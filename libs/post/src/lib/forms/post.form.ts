import { FormControl } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createPost, Post } from "../+state/post.firestore";

function createPostFormControl(params?: Post) {
  const post = createPost(params);
  return {
    isEvidence: new FormControl(post.isEvidence),
    title: new FormControl(post.title),
    description: new FormControl(post.description),
    mediaURL: new FormControl(post.mediaURL)
  }
}

export type PostFormControl = ReturnType<typeof createPostFormControl>

export class PostForm extends FormEntity<PostFormControl> {
  constructor(post?: Post) {
    super(createPostFormControl(post))
  }
}
