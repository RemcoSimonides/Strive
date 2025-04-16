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
    this.client.search({
      requests: [
        {
          indexName: environment.algolia.indexNameGoals,
          query,
          hitsPerPage: typeof hitsPerPage === 'object' ? hitsPerPage?.goals : hitsPerPage
        },
        {
          indexName: environment.algolia.indexNameUsers,
          query,
          hitsPerPage: typeof hitsPerPage === 'object' ? hitsPerPage?.profiles : hitsPerPage
        }
      ]
    }).then(({ results }) => {
      const goals = results[0].facetHits.map((hit: AlgoliaGoal) => createAlgoliaGoal(hit))
      const users = results[1].facetHits.map((hit: AlgoliaUser) => createAlgoliaUser(hit))

      this._goals.next(goals)
      this._profiles.next(users)
    })
  }

  searchGoals(query: string, category?: Category, hitsPerPage?: number | undefined): void {
    this.client.search({
      requests: [
        {
          indexName: environment.algolia.indexNameGoals,
          query,
          hitsPerPage,
          filters: `${category ? `categories:${category}` : ''}`
        }
      ]
    }).then(({ results }) => {
      const goals = results[0].facetHits.maps((hit: AlgoliaGoal) => createAlgoliaGoal(hit))
      this._goals.next(goals)
    })
  }

  searchProfiles(query: string, hitsPerPage: number | undefined): void {
    this.client.search({
      requests: [
        {
          indexName: environment.algolia.indexNameUsers,
          query,
          hitsPerPage
        }
      ]
    }).then(({ results }) => {
      const users = results[0].facetHits.map((hit: AlgoliaUser) => createAlgoliaUser(hit))
      this._profiles.next(users)
    })
  }
}
