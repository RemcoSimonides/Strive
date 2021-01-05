import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
// angularfire
import { FirestoreService } from '@strive/utils/services/firestore.service';
// services
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { SupportService } from '@strive/support/+state/support.service';
import { UserService } from '@strive/user/user/+state/user.service';
// rxjs
import { Observable } from 'rxjs';
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

  _backBtnSubscription
  _pageIsLoading: boolean

  public _supportsOpen$: Observable<Support[]>
  public _supportsToGet$: Observable<Support[]>
  public _supportsToGive$: Observable<Support[]>
  public _supportsGotten$: Observable<Support[]>

  constructor(
    public user: UserService,
    private db: FirestoreService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private _seo: SeoService,
    private supportService: SupportService
  ) { }

  ngOnInit() {

    this._pageIsLoading = true

    this._seo.generateTags({
      title: `Supports - Strive Journal`
    })

    this.user.user$.subscribe(user => {
      if (user) {
        this._supportsOpen$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('supporter.uid', '==', user.id).where('status', '==', 'open'))
        this._supportsToGet$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('receiver.uid', '==', user.id).where('status', '==', 'waiting_to_be_paid'))
        this._supportsToGive$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('supporter.uid', '==', user.id).where('status', '==', 'waiting_for_receiver'))

        // this._supportsGotten$ = this.db.collectionGroupWithIds$(`Supports`, ref => ref.where('receiver.uid', '==', user.id).where('status', '==', 'paid'))
        this._pageIsLoading = false

      } else {
        this._pageIsLoading = false
      }
    }) 

  }

  ionViewDidEnter() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => { 
        this.navCtrl.navigateRoot('explore')
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

  async openAuthModal(): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }

  async supportPaid(support: Support): Promise<void> {
    await this.supportService.changeSupportStatus(support.goal.id, support.id, 'paid')
  }
  
}
