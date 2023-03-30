import { EventType, Notification } from '@strive/model'
import { captureException } from '@sentry/node'

export type PushNotificationTarget = 'user' | 'stakeholder' | 'spectator'
export interface PushMessage {
  title: string
  body: string
  link: string
}

function createPushMessage(message: Partial<PushMessage> = {}): PushMessage {
  return {
    title: 'Something happened!',
    body: 'Go and check it out',
    link: '/goals',
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
    case 'goalDeadlinePassed':
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Goal passed its end date`,
        link: `/goal/${goal.id}`
      })

    case 'goalFinishedSuccessfully': {
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Congratulations! goal is finished`,
        link: `/goal/${goal.id}`
      })
    }

    case 'goalFinishedUnsuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Goal finished unsuccesfully`,
        link: `/goal/${goal.id}`
      })

    case 'goalMilestoneDeadlinePassed':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' passed due date`,
        link: `/goal/${goal.id}`
      })

    case 'goalMilestoneCompletedSuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' succeeded`,
        link: `/goal/${goal.id}`
      })

    case 'goalMilestoneCompletedUnsuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return createPushMessage({
        title: goal.title,
        body: `Milestone '${milestone.content}' failed`,
        link: `/goal/${goal.id}`
      })


    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        link: `/profile/${user.uid}`
      })

    case 'goalStakeholderBecameAdmin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} is now admin`,
        link: `goal/${goal.id}`
      })

    case 'goalStakeholderInvitedToJoin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} invited you to join their goal`,
        link: `goal/${goal.id}`
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
        link: `/goal/${goal.id}`
      })

    case 'goalChatMessageCreated':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} sent a message in chat`,
        link: `/goal/${goal.id}`
      })

    case 'goalCreated':
    case 'goalCreatedFinished':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected':
      return throwError(event, 'stakeholder')
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
        link: `/goal/${goal.id}`
      })

    case 'goalCreatedFinished':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: user.username,
        body: `Journaling about '${goal.title}'`,
        link: `/goal/${goal.id}`
      })

    case 'goalFinishedSuccessfully':
    if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
    if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: user.username,
        body: `Finished goal '${goal.title}'`,
        link: `/goal/${goal.id}`
      })

    case 'goalFinishedUnsuccessfully':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

        return createPushMessage({
          title: user.username,
          body: `Finished goal '${goal.title}' unsuccessfully`,
          link: `/goal/${goal.id}`
        })


    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        link: `/profile/${user.uid}`
      })


    case 'goalMilestoneDeadlinePassed':
    case 'goalMilestoneCompletedSuccessfully':
    case 'goalMilestoneCompletedUnsuccessfully':
    case 'goalStakeholderBecameAdmin':
    case 'goalStakeholderRequestToJoinRejected':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStoryPostCreated':
      throwError(event, 'spectator')
      break
    default:
      return throwError(event, 'spectator')
  }
}

function getUserPushMessage({ event, goal, milestone, user, support }: Notification): PushMessage | undefined {
  switch (event) {

    case 'goalStakeholderRequestToJoinAccepted':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Request to join accepted`,
        link: `goal/${goal.id}`
      })

    case 'goalStakeholderRequestToJoinRejected':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return createPushMessage({
        title: goal.title,
        body: `Request to join rejected`,
        link: `goal/${goal.id}`
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
        link: `supports/${support.id}?goalId=${support.goalId}`
      })
    }

    case 'goalSupportStatusPendingSuccessful': {
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      const title = milestone?.id
        ? `Milestone '${milestone.content}' completed`
        : `Goal '${goal.title}' finished`

      return createPushMessage({
        title,
        body: `Decide to give '${support.description}' or not`,
        link: `supports/${support.id}?goalId=${support.goalId}`
      })
    }

    case 'goalSupportStatusAccepted':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)

      return createPushMessage({
        title: user.username,
        body: `Now owes you '${support.description}'`,
        link: `supports/${support.id}?goalId=${support.goalId}`
      })

    case 'userSpectatorCreated':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return createPushMessage({
        title: 'New follower',
        body: `${user.username} is following you`,
        link: `/profile/${user.uid}`
      })

    default:
      throwError(event, 'user')
      break
  }
  return
}