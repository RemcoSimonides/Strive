import { EventType, Notification } from '@strive/model'

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
  console.error(`No push notification message for event ${event} and target ${target}`)
}

export function getPushMessage(notification: Notification, target: PushNotificationTarget): PushMessage | void {
  if (target === 'user') return getUserPushMessage(notification)
  if (target === 'stakeholder') return getStakeholderPushMessage(notification)
  if (target === 'spectator') return getSpectatorPushMessage(notification)
  return createPushMessage()
}

function getStakeholderPushMessage({ event, source }: Notification): PushMessage | void {
  switch (event) {
    case 'goalIsFinished':
      return createPushMessage({
        title: source.goal?.title,
        body: `Congratulations! goal is finished`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalMilestoneDeadlinePassed':
      return createPushMessage({
        title: source.goal?.title,
        body: `Milestone '${source.milestone?.content}' passed due date`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalMilestoneCompletedSuccessfully':
      return createPushMessage({
        title: source.goal?.title,
        body: `Milestone '${source.milestone?.content}' succeeded`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalMilestoneCompletedUnsuccessfully':
      return createPushMessage({
        title: source.goal?.title,
        body: `Milestone '${source.milestone?.content}' failed`,
        url: `/goal/${source.goal?.id}`
      })


    case 'goalStakeholderBecameAchiever':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} joined as Achiever`,
        url: `/profile/${source.user?.uid}`
      })

    case 'goalStakeholderBecameAdmin':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} is now admin`,
        url: `goal/${source.goal?.id}`
      })

    case 'goalStakeholderRequestedToJoin':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} requests to join goal`
      })
   
    case 'goalStoryPostCreated':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} created a new post`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalChatMessageCreated':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} sent a message in chat`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalCreated':
    case 'goalCreatedFinished':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected':

    default:
      return throwError(event, 'stakeholder')
    
  }
}

function getSpectatorPushMessage({ event, source }: Notification): PushMessage | void {
  switch (event) {
    case 'goalCreated':
      return createPushMessage({
        title: source.user?.username,
        body: `Started goal '${source.goal?.title}'`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalCreatedFinished':
      return createPushMessage({
        title: source.user?.username,
        body: `Journaling about '${source.goal?.title}'`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalIsFinished':     
      return createPushMessage({
        title: source.user?.username,
        body: `Finished goal '${source.goal?.title}'`,
        url: `/goal/${source.goal?.id}`
      })

    case 'goalStakeholderBecameAchiever':
      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} joined as Achiever`,
        url: `/profile/${source.user?.uid}`
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

function getUserPushMessage({ event, source }: Notification): PushMessage | undefined {
  switch (event) {

    case 'goalStakeholderRequestToJoinAccepted':
      return createPushMessage({
        title: source.goal?.title,
        body: `Request to join accepted`,
        url: `goal/${source.goal?.id}`
      })

    case 'goalStakeholderRequestToJoinRejected':
      return createPushMessage({
        title: source.goal?.title,
        body: `Request to join rejected`,
        url: `goal/${source.goal?.id}`
      })

    case 'goalSupportCreated': {
      const text = source.milestone?.id
        ? `supports milestone ${source.milestone.content}`
        : `supports`

      return createPushMessage({
        title: source.goal?.title,
        body: `${source.user?.username} ${text} with ${source.support?.description}`,
        url: `/goal/${source.goal?.id}`
      })
    }
  
    case 'goalSupportStatusWaitingToBePaid':
      return createPushMessage({
        title: source.user?.username,
        body: `Now owes you '${source.support?.description}'`
      })

    case 'userSpectatorCreated':
      return createPushMessage({
        title: 'New follower',
        body: `${source.user?.username} is following you`,
        url: `/profile/${source.user?.uid}`
      })

    default:
      throwError(event, 'user')
      break;
  }
  return
}