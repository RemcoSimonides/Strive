// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyD2kHICqwdpVYlaDrGESHS3O8Qss0mLdsk",
    authDomain: "lets-support-23a6c.firebaseapp.com",
    databaseURL: "https://lets-support-23a6c.firebaseio.com",
    projectId: "lets-support-23a6c",
    storageBucket: "lets-support-23a6c.appspot.com",
    messagingSenderId: "156079640882",
    appId: "1:156079640882:web:93e99452da064966",
    measurementId: "G-3J20RJ6EVP"
  },
  algolia: {
    appId: "OGEMTU2VFW",
    apiKey: "db3455ecf457168f65d91c4238522f04",
    indexNameGoals: 'dev_Goals',
    indexNameUsers: 'dev_Users'
  }
};

// Firebase Cloud Messaging (https://firebase.google.com/docs/cloud-messaging/js/client#web-v8_1)
export const vapidKey = "BBB0v4eDUHPpZVwMGCeGlhq09lCk9zMceuKAk4RRKmo6_OO8tPpJFlbPQThZxdnlAvKIa9MCB_0hR5b64CY7aEY"

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */