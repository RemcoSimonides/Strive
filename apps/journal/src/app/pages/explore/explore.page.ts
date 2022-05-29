import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
// Rxjs
import { BehaviorSubject } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
// Services
import { AlgoliaService  } from '@strive/utils/services/algolia.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { exercises } from '@strive/exercises/utils';

@Component({
  selector: 'journal-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreComponent implements OnDestroy {
  segmentChoice: 'overview' | 'search' = 'overview'

  searchForm = new FormGroup({
    query: new FormControl(''),
    type: new FormControl('all')
  })

  private _exercises = new BehaviorSubject(exercises)
  exercises$ = this._exercises.asObservable()

  private searchSubscription = this.searchForm.valueChanges.pipe(
    debounceTime(500),
    startWith(this.searchForm.value)
  ).subscribe(({ query, type }) => {
    this.segmentChoice = !query && type === 'all' ? 'overview' : 'search'
    
    switch (type) {
      case 'goals':
        this.algolia.searchGoals(query, undefined)
        break

      case 'users':
        this.algolia.searchProfiles(query, undefined)
        break
    
      case 'exercises':
      default: {
        const hpp = query ? undefined : { goals: 8, profiles: 8 } 
        this.algolia.search(query, hpp)

        const filteredExercises = exercises.filter(exercise => exercise.title.toLowerCase().includes(query.toLowerCase()))
        this._exercises.next(filteredExercises)
        break
      }
    }

  })

  constructor(
    public algolia: AlgoliaService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({ title: `Explore - Strive Journal` })
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe()
  }

  setType(type: string) {
    this.searchForm.get('type').setValue(type)
  }
}
