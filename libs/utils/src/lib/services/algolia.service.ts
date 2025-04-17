import { Injectable } from '@angular/core'
import { AlgoliaGoal, AlgoliaUser, Category, createAlgoliaGoal, createAlgoliaUser } from '@strive/model'

import { algoliasearch } from 'algoliasearch'

import { environment } from 'environments/environment'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AlgoliaService {
  private client = algoliasearch(environment.algolia.appId, environment.algolia.apiKey)

  private _goals = new BehaviorSubject<AlgoliaGoal[]>([])
  private _profiles = new BehaviorSubject<AlgoliaUser[]>([])

  goals$: Observable<AlgoliaGoal[]> = this._goals.asObservable()
  profiles$: Observable<AlgoliaUser[]> = this._profiles.asObservable()

  search(query: string, hitsPerPage?: number | { goals?: number, profiles?: number}) {
    const goalsHitsPerPage = typeof hitsPerPage === 'object' ? hitsPerPage?.goals : hitsPerPage
    const profilesHitsPerPage = typeof hitsPerPage === 'object' ? hitsPerPage?.profiles : hitsPerPage
    this.searchGoals(query, undefined, goalsHitsPerPage)
    this.searchProfiles(query, profilesHitsPerPage)
  }

  searchGoals(query: string, category?: Category, hitsPerPage?: number | undefined): void {
    this.client.searchForHits<AlgoliaGoal>({
      requests: [
        {
          indexName: environment.algolia.indexNameGoals,
          query,
          hitsPerPage,
          filters: `${category ? `categories:${category}` : ''}`
        }
      ]
    }).then(({ results }) => {
      const goals = results[0].hits.map((hit: AlgoliaGoal) => createAlgoliaGoal(hit))
      this._goals.next(goals)
    })
  }

  searchProfiles(query: string, hitsPerPage: number | undefined): void {
    this.client.searchForHits<AlgoliaUser>({
      requests: [
        {
          indexName: environment.algolia.indexNameUsers,
          query,
          hitsPerPage
        }
      ]
    }).then(({ results }) => {
      const users = results[0].hits.map((hit: AlgoliaUser) => createAlgoliaUser(hit))
      this._profiles.next(users)
    })
  }
}
