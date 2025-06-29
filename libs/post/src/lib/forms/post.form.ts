import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { createPost, Post } from '@strive/model'
import { EditMediaForm, mediaToEditMedia } from '@strive/media/forms/media.form'

function createPostFormControl(params?: Partial<Post>) {
  const post = createPost(params);
  const editMediaControls = post.medias
    ? post.medias
      .map(mediaToEditMedia)
      .map(media => new EditMediaForm(media))
    : []

  return {
    description: new FormControl(post.description, { nonNullable: true }),
    medias: new FormArray(editMediaControls ?? []),
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

  get url() { return this.controls.url }
  get medias() { return this.controls.medias}
  get youtubeId() { return this.controls.youtubeId }
  get description() { return this.controls.description }
  get date() { return this.controls.date }

  get isEmpty() {
    return !this.url.value && !this.medias.value.length && !this.description.value && !this.youtubeId.value
  }

  override patchValue(post: Partial<Post>): void {
    super.patchValue(post)

    const editMedias = post.medias ? post.medias.map(mediaToEditMedia) : []
    const editMediaFormControls = editMedias.map(editMedia => new EditMediaForm(editMedia))

    this.medias.clear()
    for (const control of editMediaFormControls) {
      this.medias.push(control)
    }
  }
}
