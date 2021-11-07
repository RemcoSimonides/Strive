import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
// Rxjs
import { BehaviorSubject, Subscription } from 'rxjs';
// Services
import { AlgoliaService  } from '@strive/utils/services/algolia.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs/operators';
import { exercises } from '@strive/exercises/utils';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnDestroy {
  segmentChoice: 'overview' | 'search' = 'overview'

  searchForm = new FormGroup({
    query: new FormControl(''),
    type: new FormControl('all')
  })

  private _exercises = new BehaviorSubject(exercises)
  exercises$ = this._exercises.asObservable()

  private backBtnSubscription: Subscription
  private searchSubscription: Subscription

  constructor(
    public algolia: AlgoliaService,
    public platform: Platform,
    public screensize: ScreensizeService,
    private seo: SeoService,
  ) {
    this.searchSubscription = this.searchForm.valueChanges.pipe(
      debounceTime(500),
      startWith(this.searchForm.value)
    ).subscribe(({ query, type }) => {
      this.segmentChoice = !query && type === 'all' ? 'overview' : 'search'
      
      switch (type) {
        case 'goals':
          this.algolia.searchGoals(query, undefined)
          break

        case 'collectiveGoals':
          this.algolia.searchCollectiveGoals(query, undefined)
          break

        case 'users':
          this.algolia.searchProfiles(query, undefined)
          break
      
        case 'exercises':
        default:
          const hpp = query ? undefined : { goals: 8, collectiveGoals: 5, profiles: 8 } 
          this.algolia.search(query, hpp)

          const filteredExercises = exercises.filter(exercise => exercise.title.toLowerCase().includes(query.toLowerCase()))
          this._exercises.next(filteredExercises)
          break
      }

    })

    this.seo.generateTags({ title: `Explore - Strive Journal` })
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe()
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

  setType(type: string) {
    this.searchForm.get('type').setValue(type)
  }
}
