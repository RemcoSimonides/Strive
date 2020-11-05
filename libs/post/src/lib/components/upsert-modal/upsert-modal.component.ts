import { Component, OnInit } from '@angular/core';
//Ionic
import { NavParams, ModalController } from '@ionic/angular'
import { Post } from '@strive/post/+state/post.firestore';
import { PostForm } from '@strive/post/forms/post.form';

@Component({
  selector: 'post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
})
export class UpsertPostModal implements OnInit {

  public postForm = new PostForm();

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams, // { achievedComponent: 'Milestone' | 'Goal' | 'CollectiveGoal' }
  ) { }

  ngOnInit() {
    let title: string;
    switch (this.navParams.get('achievedComponent'))  {
      case "Milestone": 
        title = `Completed milestone '${this.navParams.get('title')}'`
        break
      case "Goal":
        title = `Finished goal '${this.navParams.get('title')}'`
        break
      case "CollectiveGoal":
        title = `Finished goal '${this.navParams.get('title')}'`
        break
    }
    this.postForm.get('content').get('title').setValue(title);
    this.postForm.get('isEvidence').setValue(true)

    console.log('fomr value on init: ', this.postForm.value);
  }

  async cancel(): Promise<void> {
    await this.modalCtrl.dismiss()
  }

  async submitPost(): Promise<void> {

    console.log('formValue: ', this.postForm.value);

    // const post = <Post>{
    //  content: {
    //    title: 
    //  } 
    // }

    // // Prepare post object
    // post.content = {
    //   title: data.data.title,
    //   description: data.data.description,
    //   mediaURL: await this.imageService.uploadImage(`Goals/${this.goalId}/Posts/${this.goalId}`, false)
    // }
    // post.goal = {
    //   id: this.goalId,
    //   title: this.goal.title,
    //   image: this.goal.image
    // }
    // post.isEvidence = true

    // // Create post
    // await this.postService.createPost(enumPostSource.goal, this.goalId, post, this.goalId)



    await this.modalCtrl.dismiss()
  }

}
