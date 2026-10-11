// Every function is deployed with this same bundle. On a cold start only the module of the function
// that is starting (FUNCTION_TARGET) is loaded, so it does not pay for the code and dependencies of all
// the others. Without a matching FUNCTION_TARGET (deploy discovery, tests) every module is loaded.
const functions: [string[], () => Record<string, unknown>][] = [
  // pubsub
  [['scheduledTasksRunner'], () => require('./pubsub/scheduled-task-runner')],
  [['scheduledEmailRunner'], () => require('./pubsub/email/email')],
  [['bigQueryExport'], () => require('./pubsub/bigquery-export')],

  // firestorage
  [['userSpectatorChangeHandler', 'userSpectatorCreatedHandler', 'userSpectatorDeleteHandler'], () => require('./firestore/users/user-spectators/user-spectator')],
  [['affirmationsCreatedHandler', 'affirmationsChangeHandler', 'affirmationsDeleteHandler'], () => require('./firestore/users/exercises/affirmation')],
  [['selfReflectSettingsCreatedHandler', 'selfReflectSettingsChangeHandler', 'selfReflectEntryCreatedHandler', 'selfReflectEntryChangeHandler'], () => require('./firestore/users/exercises/self_reflect')],
  [['dailyGratitudeCreatedHandler', 'dailyGratitudeChangedHandler', 'dailyGratitudeDeleteHandler'], () => require('./firestore/users/exercises/daily_gratitude')],
  [['dearFutureSelfCreatedHandler', 'dearFutureSelfChangedHandler', 'dearFutureSelfDeleteHandler'], () => require('./firestore/users/exercises/dear_future_self')],
  [['wheelOfLifeCreatedHandler', 'wheelOfLifeChangedHandler', 'wheelOfLifeDeleteHandler', 'wheelOfLifeEntryCreatedHandler'], () => require('./firestore/users/exercises/wheel_of_life')],
  [['userCreatedHandler', 'userChangeHandler', 'userDeletedHandler'], () => require('./firestore/users/user')],

  [['goalCreatedHandler', 'goalChangeHandler', 'goalDeletedHandler'], () => require('./firestore/goals/goal')],
  [['goalStakeholderCreatedHandler', 'goalStakeholderChangeHandler', 'goalStakeholderDeletedHandler'], () => require('./firestore/goals/goal-stakeholder/goal-stakeholder')],
  [['goalReminderChangeHandler', 'goalReminderCreatedHandler', 'goalReminderDeleteHandler'], () => require('./firestore/goals/goal-stakeholder/reminders/reminder')],
  [['milestoneCreatedhandler', 'milestoneChangeHandler', 'milestoneDeletedHandler'], () => require('./firestore/goals/milestones/milestone')],
  [['supportCreatedHandler', 'supportChangeHandler', 'supportDeletedHandler'], () => require('./firestore/goals/supports/support')],
  [['goalInviteTokenCreatedHandler'], () => require('./firestore/goals/invite-tokens/invite-token')],
  [['postCreatedHandler', 'postDeletedHandler', 'postChangeHandler'], () => require('./firestore/goals/posts/post')],
  [['commentCreatedHandler'], () => require('./firestore/goals/comments/comment')],
  [['chatGPTMessageCreatedHandler'], () => require('./firestore/goals/chatgpt/chatgpt')],
  [['mediaDeletedHandler'], () => require('./firestore/goals/media/media')],

  [['goalEventCreatedHandler'], () => require('./firestore/goal-events/goal-events')],
  [['stravaIntegrationChangeHandler'], () => require('./firestore/strava/strava')],

  // http
  [['migrate'], () => require('./migration')],
  [['scrapeMetatags', 'downloadImageFromURL'], () => require('./https/scrape')],
  [['createCollectiveGoal'], () => require('./https/create-collective-goal')],
  [['initialiseStrava', 'listenToStrava'], () => require('./https/strava')],
  [['api'], () => require('./https/api')],
  [['createApiKeyCallable'], () => require('./https/create-api-key')],
  [['mcpServer'], () => require('./https/mcp')],
  [['emailUnsubscribe'], () => require('./https/email-unsubscribe')],
  [['image'], () => require('./https/image')],
  [['video'], () => require('./https/video')],

  // Storage
  [['videoUploadedHandler'], () => require('./storage/video')]
]

const target = process.env['FUNCTION_TARGET']
const loadAll = !functions.some(([names]) => target && names.includes(target))

for (const [names, load] of functions) {
  if (!loadAll && !names.includes(target)) continue
  const mod = load()
  for (const name of names) {
    if (!mod[name]) throw new Error(`Function ${name} is not exported by its module`)
    exports[name] = mod[name]
  }
}
