import { Component, OnInit } from '@angular/core';
//Ionic
import { NavParams, ModalController } from '@ionic/angular'
import { enumPostSource } from '@strive/post/+state/post.firestore';
import { PostForm } from '@strive/post/forms/post.form';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { PostService } from '@strive/post/+state/post.service';
import { Milestone } from '@strive/milestone/+state/milestone.firestore'

@Component({
  selector: 'post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
})
export class UpsertPostModal implements OnInit {

  public postForm = new PostForm();

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams, // { goal: Goal, milestone: Milestone, isEvidence: boolean }
    private postService: PostService
  ) { }

  ngOnInit() {
    const goal = this.navParams.get('goal') as Goal
    const milestone = this.navParams.get('milestone') as Milestone

    if (!goal) throw new Error('No goal to post the post at')

    if (!!milestone) {
      this.postForm.get('milestone').get('id').setValue(milestone.id)
      this.postForm.get('milestone').get('description').setValue(milestone.description)
      this.postForm.get('content').get('title').setValue(`Completed milestone '${goal.title}'`)
    } else {
      this.postForm.get('content').get('title').setValue(`Finished goal '${goal.title}'`)
    }

    this.postForm.get('goal').get('id').setValue(goal.id)
    this.postForm.get('goal').get('title').setValue(goal.title)
    this.postForm.get('goal').get('image').setValue(goal.image)

    this.postForm.get('isEvidence').setValue(this.navParams.get('isEvidence'))
  }

  cancel() {
    this.modalCtrl.dismiss()
  }

  async submitPost() {
    const goalId = this.postForm.get('goal').get('id').value

    // Create post
    const milestoneId = this.postForm.get('milestone').get('id').value
    if (!!milestoneId) {
      await this.postService.createPost(enumPostSource.milestone, this.postForm.value, milestoneId)
    } else {
      await this.postService.createPost(enumPostSource.goal, this.postForm.value, goalId)
    }

    await this.modalCtrl.dismiss()
  }

}
