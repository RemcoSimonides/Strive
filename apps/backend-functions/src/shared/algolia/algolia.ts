import { algoliasearch } from 'algoliasearch'
import { environment } from '@env'
import { logger } from '@strive/api/firebase'

const client = algoliasearch(process.env.ALGOLIA_APPID, process.env.ALGOLIA_APIKEY)

export const addToAlgolia = async (indexName: AlgoliaIndex, objectID: string, data): Promise<void> => {
  await client.saveObject({
    indexName,
    objectID,
    ...data
  }).catch((err) => {
    if (err) logger.error('error adding algolia object: ', err)
  })

}

export const updateAlgoliaObject = async (indexName: AlgoliaIndex, objectID: string, data): Promise<void> => {
  client.partialUpdateObject({
    indexName,
    objectID,
    ...data
  }).catch((err) => {
    if (err) logger.error('error updating algolia object', err)
  })

}

export const deleteFromAlgolia = async (indexName: AlgoliaIndex, objectID: string): Promise<void> => {
  await client.deleteObject({ indexName, objectID }).catch((err) => {
    if (err) logger.error('error deleting algolia object', err)
  })
}

export type AlgoliaIndex = keyof typeof algoliaIndex

/** A simple map to access the index name */
export const algoliaIndex = {
  goal: environment.algolia.indexNameGoals,
  user: environment.algolia.indexNameUsers
}