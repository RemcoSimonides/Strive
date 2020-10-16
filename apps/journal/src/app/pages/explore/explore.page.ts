import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { InstantSearchService } from 'apps/journal/src/app/services/instant-search/instant-search.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { ScreensizeService } from '../../services/screensize/screensize.service';
// Other
import { goalSlideOptions } from '../../../theme/goal-slide-options'

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {

  public _goalSlideOptions = goalSlideOptions
  private _backBtnSubscription: Subscription

  constructor(
    public _instantSearch: InstantSearchService,
    public _platform: Platform,
    public screensize: ScreensizeService,
    private _seo: SeoService,
  ) {}

  async ngOnInit() {
    if (this._instantSearch.lastQuery === '') {
      this._instantSearch.search('')
    }

    this._seo.generateTags({ title: `Explore - Strive Journal` })
  }

  async search(event): Promise<void> {
    const query = event.target.value

    if (query !== undefined) {
      this._instantSearch.search(query)
    }
  }

  ionViewDidEnter() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => { navigator['app'].exitApp(); });
    }
  }
    
  ionViewWillLeave() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

}
