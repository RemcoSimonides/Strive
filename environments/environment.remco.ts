// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    options: {
      apiKey: "AIzaSyAWu1vO2QZABkpvN6upV2To5wiovrMXgFs",
      authDomain: "strive-journal-remco.firebaseapp.com",
      projectId: "strive-journal-remco",
      storageBucket: "strive-journal-remco.appspot.com",
      messagingSenderId: "176497325210",
      appId: "1:176497325210:web:31ec138fe4f59222ad1b23",
      measurementId: "G-3J20RJ6EVP"
    }
  },
  algolia: {
    appId: "OGEMTU2VFW",
    apiKey: "db3455ecf457168f65d91c4238522f04",
    indexNameGoals: 'dev_Goals',
    indexNameUsers: 'dev_Users'
  },
  pexels: {
    apikey: 'cgINQggV3efRS17LqzHMz7j94VyvvUK8IgQwz31irTAGvnKeJFeFq9NQ'
  }
}

// Firebase Cloud Messaging (https://firebase.google.com/docs/cloud-messaging/js/client#web-v8_1)
export const vapidKey = "BBB0v4eDUHPpZVwMGCeGlhq09lCk9zMceuKAk4RRKmo6_OO8tPpJFlbPQThZxdnlAvKIa9MCB_0hR5b64CY7aEY"

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */