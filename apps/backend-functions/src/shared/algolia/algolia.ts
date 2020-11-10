import * as algoliasearch from 'algoliasearch';
import { algoliaAppId, sendgridAPIKey } from '../../environments/environment';
import { environment } from '../../../../../environments/environment'

const client: algoliasearch.SearchClient = algoliasearch.default(algoliaAppId, sendgridAPIKey);
let idx: algoliasearch.SearchIndex

const initAlgoliaIndex = (index: AlgoliaIndex) => {

  switch (index) {
    case 'goal':
      idx = client.initIndex(environment.algolia.indexNameGoals)
      break
    case 'collectiveGoal':
      idx = client.initIndex(environment.algolia.indexNameCollectiveGoals)
      break
    case 'user':
      idx = client.initIndex(environment.algolia.indexNameUsers)
      break
  }
}

export const addToAlgolia = async (index: AlgoliaIndex, objectID: string, data): Promise<void> => {

  initAlgoliaIndex(index)

  if (data.milestoneTemplateObject) delete data.milestoneTemplateObject
  if (data.description) delete data.description

  await idx.saveObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) console.log('error adding algolia object', err)
  })

}

export const updateAlgoliaObject = async (index: AlgoliaIndex, objectID: string, data): Promise<void> => {

  initAlgoliaIndex(index)

  if (data.milestoneTemplateObject) delete data.milestoneTemplateObject
  if (data.description) delete data.description

  idx.partialUpdateObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) console.log('error updating algolia object', err)
  })

}

export const deleteFromAlgolia = async (index: AlgoliaIndex, objectID: string): Promise<void> => {
  initAlgoliaIndex(index)
  await idx.deleteObject(objectID)
}

export type AlgoliaIndex = keyof typeof algoliaIndex;

/** A simple map to access the index name */
export const algoliaIndex = {
  goal: environment.algolia.indexNameGoals,
  collectiveGoal: environment.algolia.indexNameCollectiveGoals,
  user: environment.algolia.indexNameUsers
}