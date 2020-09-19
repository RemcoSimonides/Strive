import * as algoliasearch from 'algoliasearch';
import { algoliaAppId, sendgridAPIKey } from '../../environments/environment';

const client: algoliasearch.SearchClient = algoliasearch.default(algoliaAppId, sendgridAPIKey);
let algoliaIndex: algoliasearch.SearchIndex

const initAlgoliaIndex = (index: enumAlgoliaIndex) => {

    switch (index) {
        case enumAlgoliaIndex.dev_Goals:
            algoliaIndex = client.initIndex('dev_Goals')
            break
        case enumAlgoliaIndex.dev_CollectiveGoals:
            algoliaIndex = client.initIndex('dev_CollectiveGoals')
            break
        case enumAlgoliaIndex.prod_Users:
            algoliaIndex = client.initIndex('prod_Users')
            break
    }
}

export const addToAlgolia = async (index: enumAlgoliaIndex, objectID: string, data): Promise<void> => {

    initAlgoliaIndex(index)

    if (data.milestoneTemplateObject) delete data.milestoneTemplateObject
    if (data.description) delete data.description

    await algoliaIndex.saveObject({
        objectID,
        ...data
    }).catch((err) => {
        if (err) console.log('error adding algolia object', err)
    })

}

export const updateAlgoliaObject = async (index: enumAlgoliaIndex, objectID: string, data): Promise<void> => {

    initAlgoliaIndex(index)

    if (data.milestoneTemplateObject) delete data.milestoneTemplateObject
    if (data.description) delete data.description

    algoliaIndex.partialUpdateObject({
        objectID,
        ...data
    }).catch((err) => {
        if (err) console.log('error updating algolia object', err)
    })

}

export const deleteFromAlgolia = async (index: enumAlgoliaIndex, objectID: string): Promise<void> => {

    initAlgoliaIndex(index)

    await algoliaIndex.deleteObject(objectID)

}

export enum enumAlgoliaIndex {
    dev_Goals,
    dev_CollectiveGoals,
    prod_Users
}