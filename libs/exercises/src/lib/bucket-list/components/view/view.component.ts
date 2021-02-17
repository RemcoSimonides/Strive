import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BucketList, BucketListItem } from '../../+state/bucket-list.firestore';
import { BucketListService } from '../../+state/bucket-list.service';
import { UpsertComponent } from '../upsert/upsert.component';

@Component({
  selector: '[uid][isOwner][isSpectator] exercise-bucket-list-view',
  templateUrl: 'view.component.html',
  styleUrls: ['view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {

  bucketList$: Observable<BucketList>

  @Input() isOwner = false
  @Input() isSpectator = false
  @Input() uid: string;

  constructor(
    private modalCtrl: ModalController,
    private service: BucketListService
  ) { }

  ngOnInit() {
    this.bucketList$ = this.service.getBucketList$(this.uid).pipe(
      map(bucketlist => {
        if (!this.isOwner && this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy !== 'private')
        if (!this.isOwner && !this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy === 'public')
        return bucketlist
      }),
    )
  }

  toggle(list: BucketList, index: number) {
    if (!this.isOwner) return

    list.items[index].completed = !list.items[index].completed
    this.service.saveBucketList(this.uid, list)
  }

  edit() {
    if (!this.isOwner) return
    this.modalCtrl.create({ component: UpsertComponent }).then(modal => modal.present())
  }
}