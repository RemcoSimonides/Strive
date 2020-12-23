import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { InstantSearchService } from 'apps/journal/src/app/services/instant-search/instant-search.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { ScreensizeService } from '../../services/screensize/screensize.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {

  private backBtnSubscription: Subscription

  constructor(
    public instantSearch: InstantSearchService,
    public platform: Platform,
    public screensize: ScreensizeService,
    private seo: SeoService,
  ) {}

  async ngOnInit() {
    if (this.instantSearch.lastQuery === '') {
      this.instantSearch.search('')
    }

    this.seo.generateTags({ title: `Explore - Strive Journal` })
  }

  async search(event): Promise<void> {
    const query = event.target.value

    if (query !== undefined) {
      this.instantSearch.search(query)
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
