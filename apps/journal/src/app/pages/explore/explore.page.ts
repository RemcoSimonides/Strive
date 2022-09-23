import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
// Rxjs
import { BehaviorSubject } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'

import { exercises } from '@strive/model'

import { AlgoliaService  } from '@strive/utils/services/algolia.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { AuthService } from '@strive/user/auth/auth.service'

@Component({
  selector: 'journal-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreComponent implements OnDestroy {
  segmentChoice: 'overview' | 'search' = 'overview'

  isLoggedIn$ = this.auth.isLoggedIn$

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
    if (query === undefined || query === null) return
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

  private paramsSub = this.route.queryParams.pipe(
    map(params => params['t'])
  ).subscribe(t => {
    const typeControl = this.searchForm.get('type') as AbstractControl<string>
    if (!t) typeControl.setValue('all') 
    const types = ['goals', 'users', 'exercises']
    if (!types.includes(t)) return
    typeControl.setValue(t)
  })

  constructor(
    public algolia: AlgoliaService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({
      title: `Explore - Strive Journal`,
      description: 'Get inspired by searching goal of other users, and discover exercises to increase your chance of succeeding'
    })
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe()
    this.paramsSub.unsubscribe()
  }

  setType(type: string) {
    this.router.navigate(['.'], {
      queryParams: { t: type },
      relativeTo: this.route
    });
    const control = this.searchForm.get('type') as AbstractControl<string>
    control.setValue(type)
  }
}
