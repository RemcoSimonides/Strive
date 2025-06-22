import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, inject } from '@angular/core'
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router'

import { IonContent, IonSearchbar, IonCard, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone'

import { BehaviorSubject, combineLatest } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'

import { exercises, categories, Category } from '@strive/model'

import { AlgoliaService } from '@strive/utils/services/algolia.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { ThumbnailListComponent } from '@strive/ui/thumbnail/layout/list/thumbnail-list.component'
import { SmallThumbnailComponent } from '@strive/ui/thumbnail/components/small/small-thumbnail.component'
import { RowsPipe } from '@strive/ui/thumbnail/pipes/rows.pipe'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { FooterComponent } from '@strive/ui/footer/footer.component'


@Component({
    selector: 'journal-explore',
    templateUrl: './explore.page.html',
    styleUrls: ['./explore.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        ThumbnailListComponent,
        SmallThumbnailComponent,
        RowsPipe,
        ImageDirective,
        HeaderComponent,
        FooterComponent,
        IonContent,
        IonSearchbar,
        IonCard,
        IonSelect,
        IonSelectOption,
        IonButton
    ]
})
export class ExplorePageComponent implements OnDestroy {
  private algolia = inject(AlgoliaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  screensize = inject(ScreensizeService);
  private seo = inject(SeoService);

  @ViewChild(IonContent) content?: IonContent

  segmentChoice: 'overview' | 'search' = 'overview'

  searchForm = new FormGroup({
    query: new FormControl(''),
    category: new FormControl<Category | ''>(''),
    type: new FormControl('all')
  })

  categories$ = new BehaviorSubject(categories)
  exercises$ = new BehaviorSubject(exercises)
  goals$ = this.algolia.goals$
  profiles$ = this.algolia.profiles$

  noResults$ = combineLatest([
    this.exercises$, this.goals$, this.profiles$, this.categories$
  ]).pipe(
    map(([exercises, goals, profiles, categories]) => !exercises.length && !goals.length && !profiles.length && !categories.length)
  )

  private searchSubscription = combineLatest([
    this.searchForm.controls.query.valueChanges.pipe(debounceTime(500), startWith('')),
    this.searchForm.controls.type.valueChanges.pipe(startWith('all'))
  ]).subscribe(([query, type]) => {

    if (query === undefined || query === null) return
    this.segmentChoice = !query && type === 'all' ? 'overview' : 'search'

    switch (type) {
      case 'goals': {
        const category = this.searchForm.get('category')?.value || undefined
        this.algolia.searchGoals(query, category, undefined)
        break
      }

      case 'users':
        this.algolia.searchProfiles(query, undefined)
        break

      case 'exercises':
      case 'categories':
      default: {
        const hpp = query ? undefined : { goals: 8, profiles: 8 }
        this.algolia.search(query, hpp)

        const filteredExercises = exercises.filter(exercise => exercise.title.toLowerCase().includes(query.toLowerCase()))
        this.exercises$.next(filteredExercises)

        const filteredCategories = categories.filter(category => category.title.toLowerCase().includes(query.toLowerCase()))
        this.categories$.next(filteredCategories)

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

  private paramsSub = this.route.queryParams.subscribe(({ t, q, c }) => {
    if (c) {
      const categoryControl = this.searchForm.get('category') as AbstractControl<string>
      if (c !== categoryControl.value) categoryControl.setValue(c)
    }

    const queryControl = this.searchForm.get('query') as AbstractControl<string>
    const query = q ? q : ''
    if (query !== queryControl.value) queryControl.setValue(query)

    const typeControl = this.searchForm.get('type') as AbstractControl<string>
    const types = ['goals', 'users', 'exercises', 'categories']
    const type = types.includes(t) ? t : 'all'
    if (type !== typeControl.value) typeControl.setValue(type)

    this.content?.scrollToTop()
  })

  constructor() {
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

  filterCategory(category: Category) {
    this.router.navigate(['.'], {
      queryParams: { c: category, t: 'goals' },
      relativeTo: this.route
    })
  }
}
