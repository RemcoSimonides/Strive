import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
// Rxjs
import { BehaviorSubject } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'
// Services
import { AlgoliaService  } from '@strive/utils/services/algolia.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { exercises } from '@strive/model'
import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from '@strive/user/user/user.service'

@Component({
  selector: 'journal-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreComponent implements OnDestroy {
  segmentChoice: 'overview' | 'search' = 'overview'

  isLoggedIn$ = this.user.isLoggedIn$

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
    const typeControl = this.searchForm.get('type')! 
    if (!t) typeControl.setValue('all') 
    const types = ['goals', 'users', 'exercises']
    if (!types.includes(t)) return
    typeControl.setValue(t)
  })

  constructor(
    public algolia: AlgoliaService,
    private route: ActivatedRoute,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private user: UserService
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
    this.searchForm.get('type')!.setValue(type)
  }
}
