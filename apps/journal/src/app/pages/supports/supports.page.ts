import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { SupportService } from '@strive/support/+state/support.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Rxjs
import { Observable, of, Subscription } from 'rxjs';
// Interfaces
import { Support } from '@strive/support/+state/support.firestore'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { where } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';
import { SupportOptionsComponent } from '@strive/support/components/options/options.component';

@Component({
  selector: 'journal-supports',
  templateUrl: './supports.page.html',
  styleUrls: ['./supports.page.scss'],
})
export class SupportsComponent {
  private backBtnSubscription: Subscription

  supportsOpen$: Observable<Support[]>
  supportsToGive$: Observable<Support[]>
  supportsGiven$: Observable<Support[]>

  supportsToGet$: Observable<Support[]>
  supportsGotten$: Observable<Support[]>

  constructor(
    public user: UserService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    seo: SeoService,
    private support: SupportService
  ) {
    seo.generateTags({ title: `Supports - Strive Journal` })

    const supportsGive$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('supporter.uid', '==', user.uid)]) : of([]))
    )
    const supportsGet$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('receiver.uid', '==', user.uid)]) : of([]))
    )

    this.supportsOpen$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'open'))
    )

    this.supportsToGive$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'waiting_to_be_paid'))
    )

    this.supportsGiven$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'paid'))
    )

    this.supportsToGet$ = supportsGet$.pipe(
      map(supports => supports.filter(support => support.status === 'waiting_to_be_paid'))
    )

    this.supportsGotten$ = supportsGet$.pipe(
      map(supports => supports.filter(support => support.status === 'paid'))
    )
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  supportPaid(support: Support) {
    this.support.update(support.id, { status: 'paid' }, { params: { goalId: support.goal.id }})
  }

  openOptions(support: Support, event) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support, goalId: support.goal.id }
    }).then(popover => popover.present())
  }
  
}
