import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BucketList } from '../../+state/bucket-list.firestore';
import { BucketListService } from '../../+state/bucket-list.service';
import { BucketListUpsertComponent } from '../upsert/upsert.component';

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
    this.bucketList$ = this.service.valueChanges('BucketList', { uid: this.uid }).pipe(
      map(bucketlist => {
        if (!bucketlist) return { items: [] };
        if (!this.isOwner && this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy !== 'private')
        if (!this.isOwner && !this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy === 'public')
        return bucketlist
      })
    )
  }

  toggle(list: BucketList, index: number) {
    if (!this.isOwner) return
    list.items[index].completed = !list.items[index].completed
    this.service.upsert(list, { params: { uid: this.uid }});
  }

  edit() {
    if (!this.isOwner) return
    this.modalCtrl.create({ component: BucketListUpsertComponent }).then(modal => modal.present())
  }
}