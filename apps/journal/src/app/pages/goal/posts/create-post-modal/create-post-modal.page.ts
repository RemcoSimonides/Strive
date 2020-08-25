import { Component, OnInit } from '@angular/core';
//Ionic
import { NavParams, ModalController } from '@ionic/angular'

@Component({
  selector: 'app-create-post-modal',
  templateUrl: './create-post-modal.page.html',
  styleUrls: ['./create-post-modal.page.scss'],
})
export class CreatePostModalPage implements OnInit {

  public post = {
    title: '',
    description: ''
  }

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
  ) { }

  ngOnInit() {

    switch (this.navParams.get('achievedComponent'))  {
      case "Milestone":
        this.post.title = `Completed milestone '${this.navParams.get('title')}'`
        break
      case "Goal":
        this.post.title = `Finished goal '${this.navParams.get('title')}'`
        break
      case "CollectiveGoal":
        this.post.title = `Finished goal '${this.navParams.get('title')}'`
        break
    }

  }

  async cancel(): Promise<void> {
    await this.modalCtrl.dismiss()
  }

  async submitPost(): Promise<void> {
    await this.modalCtrl.dismiss(this.post)
  }

}