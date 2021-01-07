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

  client: algoliasearch.SearchClient
  goalsIndex: algoliasearch.SearchIndex
  collectiveGoalsIndex: algoliasearch.SearchIndex
  profilesIndex: algoliasearch.SearchIndex
  
  public lastQuery: string = ''

  private _goalResults = new BehaviorSubject([])
  private _collectiveGoalResults = new BehaviorSubject([])
  private _profileResults = new BehaviorSubject([])

  public goalResults: Observable<any> = this._goalResults.asObservable()
  public collectiveGoalResults: Observable<any> = this._collectiveGoalResults.asObservable()
  public profileResults: Observable<any> = this._profileResults.asObservable()
  
  constructor() {
    this.client = algoliasearch.default(environment.algolia.appId, environment.algolia.apiKey);
    this.goalsIndex = this.client.initIndex(environment.algolia.indexNameGoals);
    this.collectiveGoalsIndex = this.client.initIndex(environment.algolia.indexNameCollectiveGoals);
    this.profilesIndex = this.client.initIndex(environment.algolia.indexNameUsers);
  }

  search(query: string) {
    this.lastQuery = query

    this.searchGoals(query, 8)
    this.searchCollectiveGoals(query, 8)
    this.searchProfiles(query, 8)
  }

  searchGoals(query: string, hitsPerPage: number): void {
    let hits

    this.goalsIndex.search(query, {
      hitsPerPage: hitsPerPage,
      attributesToRetrieve: ['goalId', 'title', 'shortDescription', 'image', 'numberOfSupporters', 'numberOfAchievers']
    }).then((data) => {

      hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._goalResults.next(hits)
    
    })
  }

  searchCollectiveGoals(query: string, hitsPerPage: number): void {
    let hits

    this.collectiveGoalsIndex.search(query, {
      hitsPerPage: hitsPerPage,
      attributesToRetrieve: ['collectiveGoalId', 'title', 'shortDescription', 'description', 'image', 'numberOfAchievers']
    }).then((data) => {
      hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._collectiveGoalResults.next(hits)
    })
  }

  searchProfiles(query: string, hitsPerPage: number): void {
    let hits

    this.profilesIndex.search(query, {
      hitsPerPage: hitsPerPage,
      attributesToRetrieve: ['uid', 'username', 'image', 'numberOfSpectating', 'numberOfSpectators']
    }).then((data) => {
      hits = data.hits.map(hit => {
        return {
          id: hit.objectID,
          ...hit
        }
      })
      this._profileResults.next(hits)
    })
  }
  
}
