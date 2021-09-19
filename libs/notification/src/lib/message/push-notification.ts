import { enumEvent, Notification } from '../+state/notification.firestore';

interface PushMessage {
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
    url: '/feed',
    ...message
  }
}

function throwError(event: enumEvent, target: string) {
  console.error(`No push notification message for event ${event} and target ${target}`)
}

export function getPushMessage({ event, source, target }: Notification): PushMessage {
  switch (event) {
    case enumEvent.cgGoalCreated:
      return createPushMessage({ 
        title: source.collectiveGoal.title,
        body: `New goal '${source.goal.title}' created`,
        url: `/goal/${source.goal.id}`
      })
  
    case enumEvent.cgGoalFinised:
      return createPushMessage({ 
        title: source.collectiveGoal.title,
        body: `'${source.goal.title}' finished`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.cgTemplateAdded:
      return createPushMessage({
        title: source.collectiveGoal.title,
        body: `New template '${source.template.title}' created`,
        url: `/collective-goal/${source.collectiveGoal.id}/template/${source.template.id}`
      })

    case enumEvent.gNew:
      return createPushMessage({
        title: source.user.username,
        body: `Started goal '${source.goal.title}'`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gFinished:
      switch (target) {
        case 'spectator':
          return createPushMessage({
            title: source.user.username,
            body: `Finished goal '${source.goal.title}'`
          })
        
        case 'stakeholder':
          return createPushMessage({
            title: source.goal.title,
            body: `Congratulations! goal is finished`
          })

        default:
          throwError(event, target)
      }

    case enumEvent.gMilestoneCompletedSuccessfully:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.description}' succeeded`,
      })

    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.description}' failed`
      })

    case enumEvent.gMilestoneDeadlinePassed:
      return createPushMessage({
        title: source.goal.title,
        body: `Milestone '${source.milestone.description}' passed due date`
      })

    case enumEvent.gStakeholderAchieverAdded:
      switch (target) {
        case 'stakeholder':
          return createPushMessage({
            title: source.goal.title,
            body: `${source.user.username} joined as Achiever`,
            url: `/profile/${source.user.uid}`
          })
        case 'spectator':
          return createPushMessage({
            title: source.user.username,
            body: `Joined goal '${source.goal.title}'`,
            url: `/profile/${source.user.uid}`
          })
      
        default:
          throwError(event, target)
      }

    case enumEvent.gStakeholderAchieverAdded:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} is now admin`
      })

    case enumEvent.gStakeholderRequestToJoinPending:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} requests to join`
      })

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

    case enumEvent.gSupportAdded:
      const text = source.support.milestone?.id
      ? `supports milestone ${source.support.milestone.description}`
      : `supports`

      return createPushMessage({
        title: source.goal.title,
        body: `${source.support.supporter.username} ${text} with ${source.support.description}`
      })

    case enumEvent.gSupportWaitingToBePaid:
      return createPushMessage({
        title: source.user.username,
        body: `Now owes you '${source.support.description}'`
      })

    case enumEvent.gSupportPaid:
      return createPushMessage({
        title: source.user.username,
        body: `Paid support ${source.support.description}`
      })

    case enumEvent.gSupportRejected:
      return createPushMessage({
        title: source.user.username,
        body: `Rejects paying support '${source.support.description}'`
      })

    case enumEvent.gSupportPendingSuccesful:
      return createPushMessage({
        title: source.goal.title,
        body: `By you supported milestone '${source.milestone.description} succeeded'`
      })

    case enumEvent.gSupportPendingFailed:
      return createPushMessage({
        title: source.goal.title,
        body: `By you supported milestone '${source.milestone.description}' unsuccesful`
      })
    
    case enumEvent.gSupportDeleted:
      const text2 = source.milestone.id
      ? `milestone '${source.milestone.description}' has been deleted`
      : `goal '${source.goal.title}' has been deleted`

      return createPushMessage({
        title: source.goal.title,
        body: `Support '${source.support.description}' has been removed because ${text2}`
      })

    case enumEvent.gRoadmapUpdated:
      return createPushMessage({
        title: source.goal.title,
        body: `Roadmap has been updated`,
        url: `/goal/${source.goal.id}`
      })

    case enumEvent.gNewPost:
      return createPushMessage({
        title: source.goal.title,
        body: `${source.user.username} created a new post`
      })

    case enumEvent.discussionNewMessage:
      return createPushMessage({
        tag: source.goal.id ?? source.user.uid,
        title: 'New comment',
        body: source.comment.text
      })

    case enumEvent.userSpectatorAdded:
      return createPushMessage({
        title: 'New follower',
        body: `${source.user.username} is following you`,
        url: `/profile/${source.user.uid}`
      })
    
    case enumEvent.userExerciseBucketListCreated:
      return createPushMessage({
        title: source.user.username,
        body: `Created a Bucket List!`,
        url: `/profile/${source.user.uid}`
      })

    case enumEvent.userExerciseBucketListItemsAdded:
      return createPushMessage({
        title: source.user.username,
        body: `Added items to Bucket List`,
        url: `/profile/${source.user.uid}`
      })
    
    case enumEvent.userExerciseBucketListYearlyReminder:
      return createPushMessage({
        title: 'Bucket List reminder',
        body: `How is it going? Are you still doing the things you want to do?`,
        url: `/profile/${source.user.uid}`
      })

    default:
      throwError(event, target)
      break;
  }
}