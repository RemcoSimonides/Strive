import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
// Services
import { ExercisesService } from 'apps/journal/src/app/services/exercises/exercises.service';
// Interfaces
import { IBucketList, enumPrivacy } from '@strive/interfaces';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'app-exercise-bucketlist',
  templateUrl: './exercise-bucketlist.page.html',
  styleUrls: ['./exercise-bucketlist.page.scss'],
})
export class ExerciseBucketlistPage implements OnInit {

  public bucketList: IBucketList

  constructor(
    private user: UserService,
    private exercisesService: ExercisesService,
    private modalCtrl: ModalController,
    ) {
  }

  async ngOnInit() {
    this.bucketList = await this.exercisesService.getBucketList(this.user.uid)
    if (!this.bucketList.items) this.bucketList = <IBucketList>{ items: [] }
    this.addEmptyItem()
  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }

  removeControl(index: number) {
    this.bucketList.items.splice(index, 1)
    if (this.bucketList.items.length === 0 || this.bucketList.items[this.bucketList.items.length - 1].description !== '') {
      this.addEmptyItem()
    }
  }

  async saveBucketList(): Promise<void> {

    if (this.bucketList.items[this.bucketList.items.length - 1].description === '') this.bucketList.items.splice(this.bucketList.items.length - 1, 1)

    await this.exercisesService.saveBucketList(this.user.uid, this.bucketList)

    await this.modalCtrl.dismiss()
  }

  onInput($event, index: number) {
    
    if (this.bucketList.items[index].description.length === 0 && $event.detail.data !== null) {
      this.addEmptyItem()
    }

  }

  private addEmptyItem(): void {
    this.bucketList.items.push({
      description: '',
      privacy: enumPrivacy.public,
      completed: false
    })
  }

}

