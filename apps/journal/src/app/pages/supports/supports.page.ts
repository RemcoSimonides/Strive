import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
// angularfire
import { FirestoreService } from '@strive/utils/services/firestore.service';
// services
import { SeoService } from '@strive/utils/services/seo.service';
import { SupportService } from '@strive/support/+state/support.service';
import { UserService } from '@strive/user/user/+state/user.service';
// rxjs
import { Observable, Subscription } from 'rxjs';
// interfaces
import { Support } from '@strive/support/+state/support.firestore'
// components
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';

@Component({
  selector: 'app-supports',
  templateUrl: './supports.page.html',
  styleUrls: ['./supports.page.scss'],
})
export class SupportsPage implements OnInit {

  private backBtnSubscription: Subscription

  public pageIsLoading = true

  public supportsOpen$: Observable<Support[]>
  public supportsToGet$: Observable<Support[]>
  public supportsToGive$: Observable<Support[]>
  public supportsGotten$: Observable<Support[]>

  constructor(
    public user: UserService,
    private db: FirestoreService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private seo: SeoService,
    private supportService: SupportService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Supports - Strive Journal` })

    this.user.user$.subscribe(user => {
      if (user) {
        this.supportsOpen$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('supporter.uid', '==', user.id).where('status', '==', 'open'))
        this.supportsToGet$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('receiver.uid', '==', user.id).where('status', '==', 'waiting_to_be_paid'))
        this.supportsToGive$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('supporter.uid', '==', user.id).where('status', '==', 'waiting_for_receiver'))
        // this._supportsGotten$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('receiver.uid', '==', user.id).where('status', '==', 'paid'))
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

  async openAuthModal() {
    const modal = await this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }

  async supportPaid(support: Support) {
    await this.supportService.changeSupportStatus(support.goal.id, support.id, 'paid')
  }
  
}
