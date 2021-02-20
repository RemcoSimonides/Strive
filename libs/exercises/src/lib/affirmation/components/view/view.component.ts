import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Affirmations } from '../../+state/affirmation.firestore';
import { AffirmationService } from '../../+state/affirmation.service';
import { AffirmationUpsertComponent } from '../upsert/upsert.component';

@Component({
  selector: '[uid][isOwner] exercise-affirmations-view',
  templateUrl: 'view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmationsComponent implements OnInit {

  affirmations$: Observable<Affirmations>

  @Input() uid: string
  @Input() isOwner: boolean

  constructor(
    private modalCtrl: ModalController,
    private service: AffirmationService
  ) { }

  ngOnInit() {
    this.affirmations$ = this.service.getAffirmations$(this.uid)
  }

  edit() {
    this.modalCtrl.create({ component: AffirmationUpsertComponent }).then(modal => modal.present())
  }
}