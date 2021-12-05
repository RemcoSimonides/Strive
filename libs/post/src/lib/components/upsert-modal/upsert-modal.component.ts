import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
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
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  public postForm = new PostForm();
  public postId: string;

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams, // { goal: Goal, milestone: Milestone, postId: string }
    private postService: PostService
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() { 
    const goal = this.navParams.get('goal') as Goal
    const milestone = this.navParams.get('milestone') as Milestone
    this.postId = this.navParams.get('postId') as string

    const isEvidence = !!this.postId;
    if (!this.postId) this.postId = this.postService.createId()

    if (!goal) throw new Error('No goal to post the post at')

    if (!!milestone) {
      this.postForm.get('milestone').get('id').setValue(milestone.id)
      this.postForm.get('milestone').get('description').setValue(milestone.description)
      this.postForm.get('content').get('title').setValue(`Completed milestone '${milestone.description}'`)
    } else {
      const title = isEvidence ? `Finished goal '${goal.title}'` : ''
      this.postForm.get('content').get('title').setValue(title)
    }

    this.postForm.get('goal').get('id').setValue(goal.id)
    this.postForm.get('goal').get('title').setValue(goal.title)
    this.postForm.get('goal').get('image').setValue(goal.image)

    this.postForm.get('isEvidence').setValue(isEvidence)
  }

  dismiss() {
    this.location.back()
  }

  async submitPost() {
    const post = createPost({
      id: this.postId,
      ...this.postForm.value
    })
    await this.postService.add(post, { params: { goalId: post.goal.id }});
    this.dismiss()
  }

}
