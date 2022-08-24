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

  private _goalResults = new BehaviorSubject<AlgoliaGoal[]>([])
  private _profileResults = new BehaviorSubject<AlgoliaUser[]>([])

  goalResults: Observable<AlgoliaGoal[]> = this._goalResults.asObservable()
  profileResults: Observable<AlgoliaUser[]> = this._profileResults.asObservable()
  

  search(query: string, hitsPerPage?: number | { goals?: number, profiles?: number}) {
    
    this.searchGoals(query, typeof hitsPerPage === 'object' ? hitsPerPage?.goals : hitsPerPage)
    this.searchProfiles(query, typeof hitsPerPage === 'object' ? hitsPerPage?.profiles : hitsPerPage)
  }

  searchGoals(query: string, hitsPerPage: number | undefined): void {
    this.goalsIndex.search<AlgoliaGoal>(query, {
      hitsPerPage,
    }).then(data => {
      const goals = data.hits.map(hit => createAlgoliaGoal(hit))
      this._goalResults.next(goals)
    })
  }

  searchProfiles(query: string, hitsPerPage: number | undefined): void {
    this.profilesIndex.search<AlgoliaUser>(query, {
      hitsPerPage,
    }).then(data => {
      const users = data.hits.map(hit => createAlgoliaUser(hit))
      this._profileResults.next(users)
    })
  }
  
}
