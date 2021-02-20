import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BucketListService } from '../../+state/bucket-list.service';
import { BucketListItemForm } from '../../form/bucket-list.form';
import { UserService } from '@strive/user/user/+state/user.service';
import { startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
    const bucketList = await this.service.getBucketList(this.user.uid)
    bucketList.items.forEach(item => this.itemsForm.push(new BucketListItemForm(item)))

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
    const last = this.itemsForm.at(this.itemsForm.length - 1)
    if (last.value === '') this.itemsForm.removeAt(this.itemsForm.length - 1)

    this.service.saveBucketList(this.user.uid, { items: this.itemsForm.value })
    this.dismiss();
  }
}