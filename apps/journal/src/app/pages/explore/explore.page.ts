import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { AlgoliaService  } from '@strive/utils/services/algolia.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {

  private backBtnSubscription: Subscription

  constructor(
    public algolia: AlgoliaService,
    public platform: Platform,
    public screensize: ScreensizeService,
    private seo: SeoService,
  ) {}

  async ngOnInit() {
    if (this.algolia.lastQuery === '') {
      this.algolia.search('')
    }

    this.seo.generateTags({ title: `Explore - Strive Journal` })
  }

  search(event) {
    const query = event.target.value

    if (query !== undefined) {
      this.algolia.search(query)
    }
  }

  ionViewDidEnter() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { navigator['app'].exitApp(); });
    }
  }
    
  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

}
