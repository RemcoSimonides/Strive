import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
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
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private service: BucketListService,
    private toast: ToastController
  ) { }

  ngOnInit() {
    this.bucketList$ = this.service.valueChanges('BucketList', { uid: this.uid }).pipe(
      map(bucketlist => {
        if (!bucketlist) return { items: [] };
        if (!this.isOwner && this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy !== 'private')
        if (!this.isOwner && !this.isSpectator) bucketlist.items = bucketlist.items.filter(item => item.privacy === 'public')
        return bucketlist
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    )
  }

  async toggle(list: BucketList, index: number) {
    if (!this.isOwner) return
    list.items[index].completed = !list.items[index].completed
    this.service.upsert(list, { params: { uid: this.uid }});

    const toast = await this.toast.create({
      header: 'Item completed',
      position: 'bottom',
      duration: 5000,
      buttons: [
        {
          side: 'end',
          text: 'Undo',
          role: 'cancel',
          handler: () => {
            list.items[index].completed = !list.items[index].completed
            this.cdr.markForCheck()
          }
        }
      ]
    })
    await toast.present()
    const { role } = await toast.onDidDismiss()
    if (role === 'cancel') {
      list.items[index].completed = false
      this.service.upsert(list, { params: { uid: this.uid }});
    }
  }

  edit() {
    if (!this.isOwner) return
    this.modalCtrl.create({ component: BucketListUpsertComponent }).then(modal => modal.present())
  }
}