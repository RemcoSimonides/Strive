import { Component, OnInit } from '@angular/core';
//Ionic
import { NavParams, ModalController } from '@ionic/angular'
import { PostForm } from '@strive/post/forms/post.form';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { PostService } from '@strive/post/+state/post.service';
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createPost } from '@strive/post/+state/post.firestore';

@Component({
  selector: 'post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
})
export class UpsertPostModal implements OnInit {

  public postForm = new PostForm();
  public postId: string;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams, // { goal: Goal, milestone: Milestone, postId: string }
    private postService: PostService
  ) { }

  ngOnInit() {
    const goal = this.navParams.get('goal') as Goal
    const milestone = this.navParams.get('milestone') as Milestone
    this.postId = this.navParams.get('postId') as string

    const isEvidence = !!this.postId;
    if (!this.postId) this.postId = this.postService.db.createId()

    if (!goal) throw new Error('No goal to post the post at')

    if (!!milestone) {
      this.postForm.get('milestone').get('id').setValue(milestone.id)
      this.postForm.get('milestone').get('description').setValue(milestone.description)
      this.postForm.get('content').get('title').setValue(`Completed milestone '${goal.title}'`)
    } else {
      const title = isEvidence ? `Finished goal '${goal.title}'` : ''
      this.postForm.get('content').get('title').setValue(title)
    }

    this.postForm.get('goal').get('id').setValue(goal.id)
    this.postForm.get('goal').get('title').setValue(goal.title)
    this.postForm.get('goal').get('image').setValue(goal.image)

    this.postForm.get('isEvidence').setValue(isEvidence)
  }

  cancel() {
    this.modalCtrl.dismiss()
  }

  async submitPost() {
    const post = createPost({
      id: this.postId,
      ...this.postForm.value
    })
    await this.postService.add(post, { params: { goalId: post.goal.id }});
    this.modalCtrl.dismiss()
  }

}
