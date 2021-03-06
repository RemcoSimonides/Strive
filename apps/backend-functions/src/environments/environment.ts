import * as functions from 'firebase-functions';

export const environment = {
  production: false
};

export const googleserviceaccount = functions.config().googleServiceAccount;

export const algoliaAppId = functions.config().algolia?.appid ?? '';
export const algoliaApiKey = functions.config().algolia?.apikey ?? '';
