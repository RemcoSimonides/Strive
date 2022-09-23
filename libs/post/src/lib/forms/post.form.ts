import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { createPost, Post } from '@strive/model'

function createPostFormControl(params?: Partial<Post>) {
  const post = createPost(params);
  return {
    title: new FormControl(post.title, { nonNullable: true }),
    description: new FormControl(post.description, { nonNullable: true }),
    mediaURL: new FormControl(post.mediaURL, { nonNullable: true }),
    url: new FormControl(post.url, { nonNullable: true }),
    date: new FormControl(post.date, { nonNullable: true })
  }
}

export type PostFormControl = ReturnType<typeof createPostFormControl>

export class PostForm extends FormGroup<PostFormControl> {
  constructor(post?: Partial<Post>) {
    super(createPostFormControl(post))
  }

  get url() { return this.get('url') as AbstractControl<string> }
  get title() { return this.get('title') as AbstractControl<string> }
  get mediaURL() { return this.get('mediaURL') as AbstractControl<string> }
  get description() { return this.get('description') as AbstractControl<string> }
  get date() { return this.get('date') as AbstractControl<Date> }

  get isEmpty() {
    return !this.url.value && !this.title.value && !this.mediaURL.value && !this.description.value
  }
}
