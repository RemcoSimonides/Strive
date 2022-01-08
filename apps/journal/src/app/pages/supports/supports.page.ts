import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { SupportService } from '@strive/support/+state/support.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Rxjs
import { Observable, Subscription } from 'rxjs';
// Interfaces
import { Support } from '@strive/support/+state/support.firestore'
// Components
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { where } from '@angular/fire/firestore';

@Component({
  selector: 'journal-supports',
  templateUrl: './supports.page.html',
  styleUrls: ['./supports.page.scss'],
})
export class SupportsComponent implements OnInit {

  private backBtnSubscription: Subscription

  public pageIsLoading = true

  public supportsOpen$: Observable<Support[]>
  public supportsToGet$: Observable<Support[]>
  public supportsToGive$: Observable<Support[]>
  public supportsGotten$: Observable<Support[]>

  constructor(
    public user: UserService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private seo: SeoService,
    private support: SupportService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Supports - Strive Journal` })

    this.user.user$.subscribe(user => {
      if (user) {
        this.supportsOpen$ = this.support.groupChanges([where('supporter.uid', '==', user.uid), where('status', '==', 'open')])
        this.supportsToGet$ = this.support.groupChanges([where('receiver.uid', '==', user.uid), where('status', '==', 'waiting_to_be_paid')])
        this.supportsToGive$ = this.support.groupChanges([where('supporter.uid', '==', user.uid), where('status', '==', 'waiting_to_be_paid')])
        // this._supportsGotten$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('receiver.uid', '==', user.uid).where('status', '==', 'paid'))
      }

      this.pageIsLoading = false
    }) 
  }

  ionViewDidEnter() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { 
        this.navCtrl.navigateRoot('explore')
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  supportPaid(support: Support) {
    this.support.update(support.id, { status: 'paid' }, { params: { goalId: support.goal.id }})
  }
  
}
