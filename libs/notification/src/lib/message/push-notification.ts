import { EventType, Notification } from '@strive/model'
import { captureException } from '@sentry/serverless'

export type PushNotificationTarget = 'user' | 'stakeholder' | 'spectator'
export interface PushMessage {
  tag?: string
  title: string
  body: string
  icon: string
  url: string
}

function createPushMessage(message: Partial<PushMessage> = {}): PushMessage {
  return {
    title: 'Something happened!',
    body: 'Go and check it out',
    icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
    url: '/goals',
    ...message
  }
}

function throwError(event: EventType, target: string) {
  captureException(`No push notification message for event ${event} and target ${target}`)
}

export function getPushMessage(notification: Notification, target: PushNotificationTarget): PushMessage | void {
  if (target === 'user') return getUserPushMessage(notification)
  if (target === 'stakeholder') return getStakeholderPushMessage(notification)
  if (target === 'spectator') return getSpectatorPushMessage(notification)
  return createPushMessage()
}

function getStakeholderPushMessage({ event, goal, milestone, user }: Notification): PushMessage | void {
  switch (event) {
    case 'goalIsFinished':
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Congratulations! goal is finished`,
        url: `/goal/${goal.id}`
      })

    case 'goalMilestoneDeadlinePassed':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' passed due date`,
        url: `/goal/${goal.id}`
      })

    case 'goalMilestoneCompletedSuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' succeeded`,
        url: `/goal/${goal.id}`
      })

    case 'goalMilestoneCompletedUnsuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' failed`,
        url: `/goal/${goal.id}`
      })


    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        url: `/profile/${user.uid}`
      })

    case 'goalStakeholderBecameAdmin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} is now admin`,
        url: `goal/${goal.id}`
      })

    case 'goalStakeholderRequestedToJoin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} requests to join goal`
      })
   
    case 'goalStoryPostCreated':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} created a new post`,
        url: `/goal/${goal.id}`
      })

    case 'goalChatMessageCreated':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} sent a message in chat`,
        url: `/goal/${goal.id}`
      })

    case 'goalCreated':
    case 'goalCreatedFinished':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected':

    default:
      return throwError(event, 'stakeholder')
    
  }
}

function getSpectatorPushMessage({ event, goal, user  }: Notification): PushMessage | void {
  switch (event) {
    case 'goalCreated':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: user.username,
        body: `Started goal '${goal.title}'`,
        url: `/goal/${goal.id}`
      })

    case 'goalCreatedFinished':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: user.username,
        body: `Journaling about '${goal.title}'`,
        url: `/goal/${goal.id}`
      })

    case 'goalIsFinished': 
    if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
    if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: user.username,
        body: `Finished goal '${goal.title}'`,
        url: `/goal/${goal.id}`
      })

    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        url: `/profile/${user.uid}`
      })

    
    case 'goalMilestoneDeadlinePassed':
    case 'goalMilestoneCompletedSuccessfully':
    case 'goalMilestoneCompletedUnsuccessfully':
    case 'goalStakeholderBecameAdmin':
    case 'goalStakeholderRequestToJoinRejected':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected':
    case 'goalStoryPostCreated':

    default:
      throwError(event, 'spectator')
  }
}

function getUserPushMessage({ event, goal, milestone, user, support }: Notification): PushMessage | undefined {
  switch (event) {

    case 'goalStakeholderRequestToJoinAccepted':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Request to join accepted`,
        url: `goal/${goal.id}`
      })

    case 'goalStakeholderRequestToJoinRejected':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Request to join rejected`,
        url: `goal/${goal.id}`
      })

    case 'goalSupportCreated': {
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)

      const text = milestone?.id
        ? `supports milestone ${milestone.content}`
        : `supports`

      return createPushMessage({
        title: goal.title,
        body: `${user.username} ${text} with ${support.description}`,
        url: `/goal/${goal.id}`
      })
    }
  
    case 'goalSupportStatusWaitingToBePaid':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)

      return createPushMessage({
        title: user.username,
        body: `Now owes you '${support.description}'`
      })

    case 'userSpectatorCreated':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: 'New follower',
        body: `${user.username} is following you`,
        url: `/profile/${user.uid}`
      })

    default:
      throwError(event, 'user')
      break;
  }
  return
}