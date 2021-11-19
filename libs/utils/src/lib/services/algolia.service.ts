import { Injectable } from '@angular/core';
// Algolia
import * as algoliasearch from 'algoliasearch';
// Environments
import { environment } from 'environments/environment'
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlgoliaService {
  private client = algoliasearch.default(environment.algolia.appId, environment.algolia.apiKey)
  private goalsIndex = this.client.initIndex(environment.algolia.indexNameGoals)
  private collectiveGoalsIndex = this.client.initIndex(environment.algolia.indexNameCollectiveGoals)
  private profilesIndex = this.client.initIndex(environment.algolia.indexNameUsers)

  private _goalResults = new BehaviorSubject([])
  private _collectiveGoalResults = new BehaviorSubject([])
  private _profileResults = new BehaviorSubject([])

  goalResults: Observable<any> = this._goalResults.asObservable()
  collectiveGoalResults: Observable<any> = this._collectiveGoalResults.asObservable()
  profileResults: Observable<any> = this._profileResults.asObservable()
  

  search(query: string, hitsPerPage?: number | { goals?: number, collectiveGoals?: number, profiles?: number}) {
    
    this.searchGoals(query, typeof hitsPerPage === 'object' ? hitsPerPage?.goals : hitsPerPage)
    this.searchCollectiveGoals(query, typeof hitsPerPage === 'object' ? hitsPerPage?.collectiveGoals : hitsPerPage)
    this.searchProfiles(query, typeof hitsPerPage === 'object' ? hitsPerPage?.profiles : hitsPerPage)
  }

  searchGoals(query: string, hitsPerPage: number): void {
    this.goalsIndex.search(query, {
      hitsPerPage,
      attributesToRetrieve: ['goalId', 'title', 'image', 'numberOfSupporters', 'numberOfAchievers']
    }).then((data) => {
      const hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._goalResults.next(hits)
    
    })
  }

  searchCollectiveGoals(query: string, hitsPerPage: number): void {
    this.collectiveGoalsIndex.search(query, {
      hitsPerPage,
      attributesToRetrieve: ['collectiveGoalId', 'title', 'shortDescription', 'description', 'image', 'numberOfAchievers']
    }).then((data) => {
      const hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._collectiveGoalResults.next(hits)
    })
  }

  searchProfiles(query: string, hitsPerPage: number): void {
    this.profilesIndex.search(query, {
      hitsPerPage,
      attributesToRetrieve: ['uid', 'username', 'photoURL', 'numberOfSpectating', 'numberOfSpectators']
    }).then((data) => {
      const hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._profileResults.next(hits)
    })
  }
  
}
