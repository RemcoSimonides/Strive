import { Injectable } from '@angular/core'
import { AlgoliaGoal, AlgoliaUser, createAlgoliaGoal, createAlgoliaUser } from '@strive/model'

import * as algoliasearch from 'algoliasearch'

import { environment } from 'environments/environment'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AlgoliaService {
  private client = algoliasearch.default(environment.algolia.appId, environment.algolia.apiKey)
  private goalsIndex = this.client.initIndex(environment.algolia.indexNameGoals)
  private profilesIndex = this.client.initIndex(environment.algolia.indexNameUsers)

  private _goals = new BehaviorSubject<AlgoliaGoal[]>([])
  private _profiles = new BehaviorSubject<AlgoliaUser[]>([])

  goals$: Observable<AlgoliaGoal[]> = this._goals.asObservable()
  profiles$: Observable<AlgoliaUser[]> = this._profiles.asObservable()

  search(query: string, hitsPerPage?: number | { goals?: number, profiles?: number}) {
    this.searchGoals(query, typeof hitsPerPage === 'object' ? hitsPerPage?.goals : hitsPerPage)
    this.searchProfiles(query, typeof hitsPerPage === 'object' ? hitsPerPage?.profiles : hitsPerPage)
  }

  searchGoals(query: string, hitsPerPage: number | undefined): void {
    this.goalsIndex.search<AlgoliaGoal>(query, {
      hitsPerPage,
    }).then(data => {
      const goals = data.hits.map(hit => createAlgoliaGoal(hit))
      this._goals.next(goals)
    })
  }

  searchProfiles(query: string, hitsPerPage: number | undefined): void {
    this.profilesIndex.search<AlgoliaUser>(query, {
      hitsPerPage,
    }).then(data => {
      const users = data.hits.map(hit => createAlgoliaUser(hit))
      this._profiles.next(users)
    })
  }
  
}
