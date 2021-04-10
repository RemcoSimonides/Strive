import * as functions from 'firebase-functions';

export const environment = {
  production: false
};

export const googleserviceaccount = functions.config().googleServiceAccount;

export const sendgridAPIKey = functions.config().sendgrid?.key ?? '';
export const sendgridTemplate = functions.config().sendgrid?.template ?? '';

export const algoliaAppId = functions.config().algolia?.appid ?? '';
export const algoliaApiKey = functions.config().algolia?.apikey ?? '';
