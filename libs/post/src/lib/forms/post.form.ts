import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createPost, Post } from "../+state/post.firestore";

function createPostFormControl(params?: Post) {
  const post = createPost(params);
  return {
    isEvidence: new FormControl(post.isEvidence),
    author: new FormEntity<{ id: FormControl, username: FormControl, profileImage: FormControl }>({
      id: new FormControl(post.author.id),
      username: new FormControl(post.author.username),
      profileImage: new FormControl(post.author.profileImage)
    }),
    content: new FormEntity<{ title: FormControl, description: FormControl, mediaURL: FormControl }>({
      title: new FormControl(post.content.title),
      description: new FormControl(post.content.description),
      mediaURL: new FormControl(post.content.mediaURL)
    }),
    goal: new FormEntity<{ id: FormControl, title: FormControl, image: FormControl }>({
      id: new FormControl(post.goal.id),
      title: new FormControl(post.goal.title),
      image: new FormControl(post.goal.image)
    }),
    milestone: new FormEntity<{ id: FormControl, description: FormControl }>({
      id: new FormControl(post.milestone.id),
      description: new FormControl(post.milestone.description)
    })
  }
}

export type PostFormControl = ReturnType<typeof createPostFormControl>

export class PostForm extends FormEntity<PostFormControl> {
  constructor(post?: Post) {
    super(createPostFormControl(post))
  }
}
