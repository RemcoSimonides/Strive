export const environment = {
  production: true,
  firebase: {
    options: {
      apiKey: "AIzaSyAIg4VtWaOMi5ASSr9Dc5PH-memu-58xXQ",
      authDomain: "strive-journal.firebaseapp.com",
      databaseURL: "https://strive-journal.firebaseio.com",
      projectId: "strive-journal",
      storageBucket: "strive-journal.appspot.com",
      messagingSenderId: "423468347975",
      appId: "1:423468347975:web:6e2be7bea1c4475ad2f762",
      measurementId: "G-WR7H2NPKG8"
    }
  },
  algolia: {
    appId: "OGEMTU2VFW",
    apiKey: "1494086dd3c811817ac84f7293ccd733",
    indexNameGoals: 'prod_Goals',
    indexNameUsers: 'prod_Users'
  },
  pexels: {
    apikey: 'cgINQggV3efRS17LqzHMz7j94VyvvUK8IgQwz31irTAGvnKeJFeFq9NQ'
  }
}

export const vapidKey = 'BKj9FmfZe_rm1L-PRhytI_4AgCcmwJdHjKaegw5buVk5Eo7Pu3T3vf__EjlUgUfV2TAbBdzLQkDfwrwPJxjBYDI'