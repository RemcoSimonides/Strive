import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { IonContent } from '@ionic/angular'

// Rxjs
import { BehaviorSubject, combineLatest } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'

import { exercises } from '@strive/model'

import { AlgoliaService  } from '@strive/utils/services/algolia.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'journal-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorePageComponent implements OnDestroy {
  @ViewChild(IonContent) content?: IonContent

  segmentChoice: 'overview' | 'search' = 'overview'

  searchForm = new FormGroup({
    query: new FormControl(''),
    type: new FormControl('all')
  })

  exercises$ = new BehaviorSubject(exercises)
  goals$ = this.algolia.goals$
  profiles$ = this.algolia.profiles$

  noResults$ = combineLatest([
    this.exercises$, this.goals$, this.profiles$
  ]).pipe(
    map(([exercises, goals, profiles]) => !exercises.length && !goals.length && !profiles.length)
  )

  private searchSubscription = combineLatest([
    this.searchForm.controls.query.valueChanges.pipe(debounceTime(500), startWith('')),
    this.searchForm.controls.type.valueChanges.pipe(startWith('all'))
  ]).subscribe(([query, type]) => {

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
        this.exercises$.next(filteredExercises)
        break
      }
    }

    const queryParams: Params = {}
    if (type && type !== 'all') queryParams['t'] = type
    if (query) queryParams['q'] = query

    const currentParams = this.router.parseUrl(this.router.url).queryParams
    const emptyParams = { q: null, t: null }

    if (!Object.keys(currentParams).length && !Object.keys(queryParams).length) {
      //  don't update params if there are no params anyway because this will prevent NavigationEnd router event
      return
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(queryParams).length ? queryParams : emptyParams,
      queryParamsHandling: 'merge'
    })
  })

  private paramsSub = this.route.queryParams.subscribe(({ t, q }) => {
    const queryControl = this.searchForm.get('query') as AbstractControl<string>
    const query = q ? q : ''
    if (query !== queryControl.value) queryControl.setValue(query)

    const typeControl = this.searchForm.get('type') as AbstractControl<string>
    const types = ['goals', 'users', 'exercises']
    const type = types.includes(t) ? t : 'all'
    if (type !== typeControl.value) typeControl.setValue(type)

    this.content?.scrollToTop()
  })

  constructor(
    private algolia: AlgoliaService,
    private route: ActivatedRoute,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({
      title: `Explore - Strive Journal`,
      description: 'Get inspired by searching goal of other users, and discover exercises which help to increase your chance of succeeding'
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
    })
    const control = this.searchForm.get('type') as AbstractControl<string>
    control.setValue(type)
  }
}
