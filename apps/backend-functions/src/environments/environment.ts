import * as functions from 'firebase-functions';

export const environment = {
  production: false
};

export const googleserviceaccount = functions.config().googleServiceAccount;

export const algoliaAppId = functions.config().algolia?.appid ?? '';
export const algoliaApiKey = functions.config().algolia?.apikey ?? '';

export const urlmetaUsername = functions.config().urlmeta.username ?? '';
export const urlmetaApiKey = functions.config().urlmeta.apikey ?? '';

export const sendgridApiKey = functions.config().sendgrid.apikey ?? '';