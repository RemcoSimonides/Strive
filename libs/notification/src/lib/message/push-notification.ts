import { enumEvent, Notification } from '@strive/model'

export type PushNotificationTarget = 'user' | 'stakeholder' | 'spectator'
export interface PushMessage {
  tag?: string;
  title: string;
  body: string;
  icon: string;
  url: string;
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

function throwError(event: enumEvent, target: string) {
  console.error(`No push notification message for event ${event} and target ${target}`)
}

export function getPushMessage(notification: Notification, target: PushNotificationTarget): PushMessage {
  if (target === 'user') return getUserPushMessage(notification)
  if (target === 'stakeholder') return getStakeholderPushMessage(notification)
  if (target === 'spectator') return getSpectatorPushMessage(notification)
}

function getStakeholderPushMessage({ event, source }: Notification): PushMessage {
  switch (event) {
    case enumEvent.gFinished:
      return createPushMessage({
        title: source.goal.title,
        body: `Congratulations! goal is finished`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gMilestoneDeadlinePassed:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.content}' passed due date`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gMilestoneCompletedSuccessfully:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.content}' succeeded`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.content}' failed`,
        url: `/goal/${source.goal.id}`
      })


    case enumEvent.gStakeholderAchieverAdded:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} joined as Achiever`,
        url: `/profile/${source.user.uid}`
      })

    case enumEvent.gStakeholderAdminAdded:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} is now admin`,
        url: `goal/${source.goal.id}`
      })

    case enumEvent.gStakeholderRequestToJoinPending:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} requests to join goal`
      })
   
    case enumEvent.gNewPost:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} created a new post`,
        url: `/goal/${source.goal.id}`
      })
    
    case enumEvent.gSupportAdded: {
      const text = source.milestone?.id
        ? `supports milestone ${source.milestone.content}`
        : `supports`

      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} ${text} with ${source.support.description}`,
        url: `/goal/${source.goal.id}`
      })
    }

    case enumEvent.gNewActive:
    case enumEvent.gNewBucketlist:
    case enumEvent.gNewFinished:
    case enumEvent.gStakeholderRequestToJoinAccepted:
    case enumEvent.gStakeholderRequestToJoinRejected:

    default:
      throwError(event, 'stakeholder')
    
  }
}

function getSpectatorPushMessage({ event, source }: Notification): PushMessage {
  switch (event) {
    case enumEvent.gNewBucketlist:
      return createPushMessage({
        title: source.user.username,
        body: `Added goal to Bucket list '${source.goal.title}'`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gNewActive:
      return createPushMessage({
        title: source.user.username,
        body: `Started goal '${source.goal.title}'`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gNewFinished:
      return createPushMessage({
        title: source.user.username,
        body: `Journaling about '${source.goal.title}'`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gFinished:     
      return createPushMessage({
        title: source.user.username,
        body: `Finished goal '${source.goal.title}'`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gStakeholderAchieverAdded:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} joined as Achiever`,
        url: `/profile/${source.user.uid}`
      })

    
    case enumEvent.gMilestoneDeadlinePassed:
    case enumEvent.gMilestoneCompletedSuccessfully:
    case enumEvent.gMilestoneCompletedUnsuccessfully:
    case enumEvent.gStakeholderAdminAdded:
    case enumEvent.gStakeholderRequestToJoinPending:
    case enumEvent.gStakeholderRequestToJoinAccepted:
    case enumEvent.gStakeholderRequestToJoinRejected:
    case enumEvent.gNewPost:

    default:
      throwError(event, 'spectator')
  }
}

function getUserPushMessage({ event, source }: Notification): PushMessage {
  switch (event) {

    case enumEvent.gStakeholderRequestToJoinAccepted:
      return createPushMessage({
        title: source.goal.title,
        body: `Request to join accepted`,
        url: `goal/${source.goal.id}`
      })

    case enumEvent.gStakeholderRequestToJoinRejected:
      return createPushMessage({
        title: source.goal.title,
        body: `Request to join rejected`,
        url: `goal/${source.goal.id}`
      })
  
    case enumEvent.gSupportWaitingToBePaid:
      return createPushMessage({
        title: source.user.username,
        body: `Now owes you '${source.support.description}'`
      })

    // case enumEvent.gSupportPaid:
    //   return createPushMessage({
    //     title: source.user.username,
    //     body: `Paid support ${source.support.description}`
    //   })

    // case enumEvent.gSupportRejected:
    //   return createPushMessage({
    //     title: source.user.username,
    //     body: `Rejects paying support '${source.support.description}'`
    //   })

    // case enumEvent.gSupportPendingSuccesful:
    //   return createPushMessage({
    //     title: source.goal.title,
    //     body: `By you supported milestone '${source.milestone.content} succeeded'`
    //   })

    // case enumEvent.gSupportPendingFailed:
    //   return createPushMessage({
    //     title: source.goal.title,
    //     body: `By you supported milestone '${source.milestone.content}' unsuccesful`
    //   })
    
  //   case enumEvent.gSupportDeleted: {
  //     const text2 = source.milestone.id
  //     ? `milestone '${source.milestone.content}' has been deleted`
  //     : `goal '${source.goal.title}' has been deleted`

  //     return createPushMessage({
  //       title: source.goal.title,
  //       body: `Support '${source.support.description}' has been removed because ${text2}`
  //     })
  //   }

    case enumEvent.userSpectatorAdded:
      return createPushMessage({
        title: 'New follower',
        body: `${source.user.username} is following you`,
        url: `/profile/${source.user.uid}`
      })

    default:
      throwError(event, 'user')
      break;
  }
}