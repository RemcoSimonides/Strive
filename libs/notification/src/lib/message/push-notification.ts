import { Notification, PushNotificationSettingKey, PushNotificationSettingKeyExcludeMain } from '@strive/model'
import { captureException } from '@sentry/node'

export const PushNotificationSetting: Record<PushNotificationSettingKeyExcludeMain, PushNotificationSettingKey[]> = {
  'goalGeneral': ['main', 'goalMain', 'goalGeneral'],
  'goalTeam': ['main', 'goalMain', 'goalTeam'],
  'goalChat': ['main', 'goalMain', 'goalChat'],
  'goalRoadmap': ['main', 'goalMain', 'goalRoadmap'],
  'goalStory': ['main', 'goalMain', 'goalStory'],
  'supports': ['main', 'supports'],
  'userSpectatingGeneral': ['main', 'userSpectatingGeneral'],
  'exerciseAffirmations': ['main', 'exerciseAffirmations'],
  'exerciseDailyGratitude': ['main', 'exerciseDailyGratitude'],
  'exerciseDearFutureSelf': ['main', 'exerciseDearFutureSelf'],
  'exerciseSelfReflect': ['main', 'exerciseSelfReflect'],
  'exerciseWheelOfLife': ['main', 'exerciseWheelOfLife']
}

export type PushNotificationTarget = 'user' | 'stakeholder' | 'spectator'

export interface PushMessage {
  title: string
  body: string
  link: string
  tag?: string // groups the notifications together
  setting: keyof typeof PushNotificationSetting
}

export function getPushMessage(notification: Notification, target: PushNotificationTarget): PushMessage | void {
  if (target === 'user') return getUserPushMessage(notification)
  if (target === 'stakeholder') return getStakeholderPushMessage(notification)
  if (target === 'spectator') return getSpectatorPushMessage(notification)
}

function getStakeholderPushMessage({ event, goal, milestone, user, comment }: Notification): PushMessage | void {
  switch (event) {
    case 'goalDeadlinePassed':
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return {
        title: goal.title,
        body: `Goal passed its end date`,
        link: `/goal/${goal.id}`,
        setting: 'goalGeneral'
      }

    case 'goalFinishedSuccessfully': {
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return {
        title: goal.title,
        body: `Congratulations! goal is finished`,
        link: `/goal/${goal.id}`,
        setting: 'goalGeneral'
      }
    }

    case 'goalFinishedUnsuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)

      return {
        title: goal.title,
        body: `Goal finished unsuccesfully`,
        link: `/goal/${goal.id}`,
        setting: 'goalGeneral'
      }

    case 'goalMilestoneDeadlinePassed':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return {
        title: goal.title,
        body: `Milestone '${milestone.content}' passed due date`,
        link: `/goal/${goal.id}`,
        setting : 'goalRoadmap'
      }

    case 'goalMilestoneCompletedSuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return {
        title: goal.title,
        body: `Milestone '${milestone.content}' succeeded`,
        link: `/goal/${goal.id}`,
        setting: 'goalRoadmap'
      }

    case 'goalMilestoneCompletedUnsuccessfully':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!milestone) throw new Error(`${event} push message needs milestone defined`)

      return {
        title: goal.title,
        body: `Milestone '${milestone.content}' failed`,
        link: `/goal/${goal.id}`,
        setting: 'goalRoadmap'
      }

    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        link: `/profile/${user.uid}`,
        setting: 'goalTeam'
      }

    case 'goalStakeholderBecameAdmin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} is now admin`,
        link: `goal/${goal.id}`,
        setting: 'goalTeam'
      }

    case 'goalStakeholderInvitedToJoin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} invited you to join their goal`,
        link: `goal/${goal.id}`,
        setting: 'goalTeam'
      }

    case 'goalStakeholderRequestedToJoin':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} requests to join goal`,
        link: `goal/${goal.id}`,
        setting: 'goalTeam'
      }

    case 'goalStoryPostCreated':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} created a new post`,
        link: `/goal/${goal.id}`,
        setting: 'goalStory'
      }

    case 'goalChatMessageCreated':
      if (!goal) throw new Error(`${event} push message needs goal defined`)
      if (!user) throw new Error(`${event} push message needs user defined`)
      if (!comment) throw new Error(`${event} push message needs comment defined`)

      return {
        title: `${user.username} in ${goal.title}`,
        body: comment,
        link: `/goal/${goal.id}`,
        tag: `goal/${goal.id}/chat`,
        setting: 'goalChat'
      }

    case 'goalCreated':
    case 'goalCreatedFinished':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected':
      captureException(`No push notification message for event ${event} and target 'stakeholder'`)
      return
    default:
      captureException(`No push notification message for event ${event} and target 'stakeholder'`)
      return
  }
}

function getSpectatorPushMessage({ event, goal, user  }: Notification): PushMessage | void {
  switch (event) {
    case 'goalCreated':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return {
        title: user.username,
        body: `Started goal '${goal.title}'`,
        link: `/goal/${goal.id}`,
        setting: 'userSpectatingGeneral'
      }

    case 'goalCreatedFinished':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return {
        title: user.username,
        body: `Journaling about '${goal.title}'`,
        link: `/goal/${goal.id}`,
        setting: 'userSpectatingGeneral'
      }

    case 'goalFinishedSuccessfully':
    if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
    if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return {
        title: user.username,
        body: `Finished goal '${goal.title}'`,
        link: `/goal/${goal.id}`,
        setting: 'userSpectatingGeneral'
      }

    case 'goalFinishedUnsuccessfully':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

        return {
          title: user.username,
          body: `Finished goal '${goal.title}' unsuccessfully`,
          link: `/goal/${goal.id}`,
          setting: 'userSpectatingGeneral'
        }

    case 'goalStakeholderBecameAchiever':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return {
        title: goal.title,
        body: `${user.username} joined as Achiever`,
        link: `/profile/${user.uid}`,
        setting: 'userSpectatingGeneral'
      }

    case 'goalMilestoneDeadlinePassed':
    case 'goalMilestoneCompletedSuccessfully':
    case 'goalMilestoneCompletedUnsuccessfully':
    case 'goalStakeholderBecameAdmin':
    case 'goalStakeholderRequestToJoinRejected':
    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStoryPostCreated':
      captureException(`No push notification message for event ${event} and target 'spectator'`)
      return
    default:
      captureException(`No push notification message for event ${event} and target 'spectator'`)
      return
  }
}

function getUserPushMessage({ event, goal, milestone, user, support }: Notification): PushMessage | undefined {
  switch (event) {
    case 'goalStakeholderRequestToJoinAccepted':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return {
        title: goal.title,
        body: `Request to join accepted`,
        link: `goal/${goal.id}`,
        setting: 'goalTeam'
      }

    case 'goalStakeholderRequestToJoinRejected':
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      return {
        title: goal.title,
        body: `Request to join rejected`,
        link: `goal/${goal.id}`,
        setting: 'goalTeam'
      }

    case 'goalSupportCreated': {
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)

      const text = milestone?.id
        ? `supports milestone ${milestone.content}`
        : `supports`

      return {
        title: goal.title,
        body: `${user.username} ${text} with ${support.description}`,
        link: `supports/${support.id}?goalId=${support.goalId}`,
        setting: 'supports'
      }
    }

    case 'goalSupportStatusPendingSuccessful': {
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)
      if (!goal) throw new Error(`${event} spectator push message needs goal defined`)

      const title = milestone?.id
        ? `Milestone '${milestone.content}' completed`
        : `Goal '${goal.title}' finished`

      return {
        title,
        body: `Decide to give '${support.description}' or not`,
        link: `supports/${support.id}?goalId=${support.goalId}`,
        setting: 'supports'
      }
    }

    case 'goalSupportStatusAccepted':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)
      if (!support) throw new Error(`${event} spectator push message needs support defined`)

      return {
        title: user.username,
        body: `Now owes you '${support.description}'`,
        link: `supports/${support.id}?goalId=${support.goalId}`,
        setting: 'supports'
      }

    case 'userSpectatorCreated':
      if (!user) throw new Error(`${event} spectator push message needs user defined`)

      return {
        title: 'New follower',
        body: `${user.username} is following you`,
        link: `/profile/${user.uid}`,
        setting: 'userSpectatingGeneral'
      }
    default:
      captureException(`No push notification message for event ${event} and target 'user'`)
      return
  }
}