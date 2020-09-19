import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { ExercisesService } from 'apps/journal/src/app/services/exercises/exercises.service';
// Interfaces
import { IBucketList, enumPrivacy } from '@strive/interfaces';

@Component({
  selector: 'app-exercise-bucketlist',
  templateUrl: './exercise-bucketlist.page.html',
  styleUrls: ['./exercise-bucketlist.page.scss'],
})
export class ExerciseBucketlistPage implements OnInit {

  public bucketList: IBucketList

  constructor(
    private authService: AuthService,
    private exercisesService: ExercisesService,
    private modalCtrl: ModalController,
    ) {
  }

  async ngOnInit() {
    const { uid } = await this.authService.afAuth.currentUser;
    this.bucketList = await this.exercisesService.getBucketList(uid)
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

    const { uid } = await this.authService.afAuth.currentUser;
    await this.exercisesService.saveBucketList(uid, this.bucketList)

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

