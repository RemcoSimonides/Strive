import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { createPost, Post } from '@strive/model'

function createPostFormControl(params?: Partial<Post>) {
  const post = createPost(params);
  return {
    description: new FormControl(post.description, { nonNullable: true }),
    mediaURL: new FormControl(post.mediaURL, { nonNullable: true }),
    youtubeId: new FormControl(post.youtubeId, { nonNullable: true }),
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
  get mediaURL() { return this.get('mediaURL') as AbstractControl<string> }
  get youtubeId() { return this.get('youtubeId') as AbstractControl<string> }
  get description() { return this.get('description') as AbstractControl<string> }
  get date() { return this.get('date') as AbstractControl<Date> }

  get isEmpty() {
    return !this.url.value && !this.mediaURL.value && !this.description.value && !this.youtubeId.value
  }
}
