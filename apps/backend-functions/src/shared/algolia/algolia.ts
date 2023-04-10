import * as algoliasearch from 'algoliasearch'
import { environment } from '@env'
import { logger } from '@strive/api/firebase'

const client: algoliasearch.SearchClient = algoliasearch.default(process.env.ALGOLIA_APPID, process.env.ALGOLIA_APIKEY)
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

  await idx.saveObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) logger.error('error adding algolia object: ', err)
  })

}

export const updateAlgoliaObject = async (index: AlgoliaIndex, objectID: string, data): Promise<void> => {
  initAlgoliaIndex(index)

  idx.partialUpdateObject({
    objectID,
    ...data
  }).catch((err) => {
    if (err) logger.error('error updating algolia object', err)
  })

}

export const deleteFromAlgolia = async (index: AlgoliaIndex, objectID: string): Promise<void> => {
  initAlgoliaIndex(index)
  await idx.deleteObject(objectID).catch((err) => {
    if (err) logger.error('error deleting algolia object', err)
  })
}

export type AlgoliaIndex = keyof typeof algoliaIndex

/** A simple map to access the index name */
export const algoliaIndex = {
  goal: environment.algolia.indexNameGoals,
  user: environment.algolia.indexNameUsers
}