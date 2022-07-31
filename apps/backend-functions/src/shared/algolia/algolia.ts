import * as algoliasearch from 'algoliasearch';
import { algoliaApiKey, algoliaAppId } from '../../environments/environment';
import { environment } from '../../../../../environments/environment'

const client: algoliasearch.SearchClient = algoliasearch.default(algoliaAppId, algoliaApiKey);
let idx: algoliasearch.SearchIndex

const initAlgoliaIndex = (index: AlgoliaIndex) => {

  switch (index) {
    case 'goal':
      idx = client.initIndex(environment.algolia.indexNameGoals)
      break
    case 'user':
      idx = client.initIndex(environment.algolia.indexNameUsers)
      break
  }
}

export const addToAlgolia = async (index: AlgoliaIndex, objectID: string, data): Promise<void> => {

  initAlgoliaIndex(index)

  if (data.description) delete data.description

  await idx.saveObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) console.error('error adding algolia object: ', JSON.stringify(err))
  })

}

export const updateAlgoliaObject = async (index: AlgoliaIndex, objectID: string, data): Promise<void> => {

  initAlgoliaIndex(index)

  if (data.description) delete data.description

  idx.partialUpdateObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) console.error('error updating algolia object', JSON.stringify(err))
  })

}

export const deleteFromAlgolia = async (index: AlgoliaIndex, objectID: string): Promise<void> => {
  initAlgoliaIndex(index)
  await idx.deleteObject(objectID).catch((err) => {
    if (err) console.error('error deleting algolia object', JSON.stringify(err))
  })
}

export type AlgoliaIndex = keyof typeof algoliaIndex;

/** A simple map to access the index name */
export const algoliaIndex = {
  goal: environment.algolia.indexNameGoals,
  user: environment.algolia.indexNameUsers
}