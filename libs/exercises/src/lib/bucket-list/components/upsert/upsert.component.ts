import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BucketListService } from '../../+state/bucket-list.service';
import { BucketListItemForm } from '../../form/bucket-list.form';
import { UserService } from '@strive/user/user/+state/user.service';
import { startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BucketListItem } from '../../+state/bucket-list.firestore';

@Component({
  selector: 'exercise-upsert-bucket-list',
  templateUrl: 'upsert.component.html',
  styleUrls: ['upsert.component.scss']
})

export class BucketListUpsertComponent implements OnInit, OnDestroy {

  itemsForm = new FormArray([])

  private sub: Subscription

  constructor(
    private user: UserService,
    private modalCtrl: ModalController,
    private service: BucketListService
  ) { }

  async ngOnInit() { 
    const bucketList = await this.service.getValue('BucketList', { uid: this.user.uid })
    if (!!bucketList && !!bucketList.items) {
      bucketList.items.forEach(item => this.itemsForm.push(new BucketListItemForm(item)))
    }

    this.sub = this.itemsForm.valueChanges.pipe(startWith(this.itemsForm.value)).subscribe(items => {
      if (!items.some(item => !item.description)) this.add()
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

  add() {
    this.itemsForm.push(new BucketListItemForm())
  }

  save() {
    const items = (this.itemsForm.value as BucketListItem[]).filter(item => !!item.description)
    this.service.upsert({ id: 'BucketList', items }, { params: { uid: this.user.uid }})
    this.dismiss();
  }
}