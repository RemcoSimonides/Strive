import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
//Ionic
import { NavParams, ModalController } from '@ionic/angular'
// Strive
import { PostService } from '@strive/post/+state/post.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { PostForm } from '@strive/post/forms/post.form';
import { createPost } from '@strive/post/+state/post.firestore';

@Component({
  selector: 'post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
})
export class UpsertPostModalComponent implements OnInit {
  postForm = new PostForm()
  
  @Input() postId: string
  @Input() goalId: string
  @Input() milestoneId: string
  
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams, // { goal: Goal, milestone: Milestone, postId: string }
    private postService: PostService,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() { 
    const isEvidence = !!this.postId;
    if (!this.postId) this.postId = this.postService.createId()
    if (!this.goalId) throw new Error('No goal to post the post at')

    this.postForm.get('isEvidence').setValue(isEvidence)
  }

  dismiss() {
    this.location.back()
  }

  async submitPost() {
    if (!this.user.uid) return
    const post = createPost({
      id: this.postId,
      goalId: this.goalId,
      uid: this.user.uid,
      ...this.postForm.value
    })
    if (this.milestoneId) post.milestoneId = this.milestoneId
    await this.postService.add(post, { params: { goalId: this.goalId }});
    this.dismiss()
  }

}
