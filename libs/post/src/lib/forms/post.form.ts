import { FormControl } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createPost, Post } from '@strive/model'

function createPostFormControl(params?: Post) {
  const post = createPost(params);
  return {
    isEvidence: new FormControl(post.isEvidence),
    title: new FormControl(post.title),
    description: new FormControl(post.description),
    mediaURL: new FormControl(post.mediaURL),
    url: new FormControl(post.url),
    date: new FormControl(post.date)
  }
}

export type PostFormControl = ReturnType<typeof createPostFormControl>

export class PostForm extends FormEntity<PostFormControl> {
  constructor(post?: Post) {
    super(createPostFormControl(post))
  }

  get url() { return this.get('url') }
  get title() { return this.get('title') }
  get mediaURL() { return this.get('mediaURL') }
  get description() { return this.get('description') }
  get date() { return this.get('date') }

  get isEmpty() {
    return !this.url.value && !this.title.value && !this.mediaURL.value && !this.description.value
  }
}
