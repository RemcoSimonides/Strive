import { enumEvent, Notification, NotificationMessageText, Source, SupportDecisionMeta } from '../+state/notification.firestore';

const notificationIcons = [
  'alert-outline',
  'bookmark-outline',
  'chatbox-outline',
  'checkmark-outline',
  'create-outline',
  'flag-outline',
  'heart-outline',
  'heart-dislike-outline',
  'person-add-outline',
  'person-remove-outline',
  'remove-outline'
] as const
type NotificationIcons = typeof notificationIcons[number];

function throwError(event: enumEvent, target: string) {
  throw new Error(`No notification message for event ${event} and target ${target}`)
}

function get(type: 'user' | 'goal' | 'collectiveGoal', source: Source): { title: string, image: string, link: string } {
  const data = {
    user: {
      title: source.user?.username,
      image: source.user?.photoURL,
      link: `/profile/${source.user?.uid}`
    },
    goal: {
      title: source.goal?.title,
      image: source.goal?.image,
      link: `/goal/${source.goal?.id}`
    },
    collectiveGoal: {
      title: source.collectiveGoal?.title,
      image: source.collectiveGoal?.image,
      link: `/collective-goal/${source.collectiveGoal?.id}`
    }
  }
  return data[type]
}

export function getNotificationMessage({ event, source, meta, target }: Notification): { title: string, image: string, link: string, icon: NotificationIcons, message: NotificationMessageText[] } {
  switch (event) {
    case enumEvent.cgGoalCreated:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            icon: 'flag-outline',
            message: [
              { text: `A new goal has been created in collective goal "${source.collectiveGoal.title}", can you help out?` }
            ]  
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.cgGoalFinised:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            icon: 'flag-outline',
            message: [
              { text: `Goal "` },
              { 
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              {
                text: `" is finished!`
              }
            ]
          }
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.cgTemplateAdded:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            icon: 'create-outline',
            message: [
              { text: `New template "` },
              {
                text: source.template.title,
                link: `collective-goal/${source.collectiveGoal.id}/template/${source.template.id}`
              },
              { text: `" has been created` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gNew: // deprecated 4/12/2012

      switch (target) {
        case 'goal':
          return {
            ...get('goal', source),
            icon: 'flag-outline',
            message: [
              { text: `New goal is created! Best of luck` }
            ]
          }

        case 'spectator':
          return {
            ...get('user', source),
            icon: 'flag-outline',
            message: [
              { text: `Created goal "` },
              { 
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `". Can you help out?` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gNewBucketlist:
    case enumEvent.gNewActive:
    case enumEvent.gNewFinished:
      switch (target) {
        case 'goal':
          return {
            ...get('goal', source),
            icon: 'flag-outline',
            message: [
              { text: `Goal created` }
            ]
          }

        case 'spectator': {
          let message: NotificationMessageText[];
          if (event === enumEvent.gNewBucketlist) {
            message = [
              { text: `Added "` },
              { text: source.goal.title, link: `goal/${source.goal.id}` },
              { text: `" to bucket list` }
            ]
          } else if (event === enumEvent.gNewActive) {
            message = [
              { text: `Started goal "` },
              { text: source.goal.title, link: `goal/${source.goal.id}` },
              { text: `"` }
            ]
          } else if (event === enumEvent.gNewFinished) {
            message = [
              { text: `Started journaling about "` },
              { text: source.goal.title, link: `goal/${source.goal.id}` },
              { text: `"` }
            ]
          }

          return {
            ...get('user', source),
            icon: 'flag-outline',
            message
          }
        }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gFinished:

      switch (target) {
        case 'goal':
          return {
            ...get('goal', source),
            icon: 'flag-outline',
            message: [{ text: `Goal is finished!` }]
          }

        case 'spectator':
          return {
            ...get('user', source),
            icon: 'flag-outline',
            message: [
              { text: `Finished goal "` },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `"` }
            ]
          }

        case 'stakeholder':
          // Can be support decision notification
          if ((meta as SupportDecisionMeta).type === 'supportDecision') {
            return {
              ...get('goal', source),
              icon: 'flag-outline',
              message: [
                { text: 'Goal has been completed!' }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              icon: 'flag-outline',
              message: [
                { text: `Goal has been marked as finished` }
              ]
            }
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gMilestoneCompletedSuccessfully:
      switch (target) {
        case 'goal':
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'checkmark-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" successfully completed` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gMilestoneCompletedUnsuccessfully:
      switch (target) {
        case 'goal':
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'checkmark-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" failed to complete` }
            ]
          }
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gMilestoneDeadlinePassed:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'alert-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" of goal "${source.goal.title}" passed its due date` }
            ]
          }
        case 'goal':
          return {
            ...get('goal', source),
            icon: 'alert-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" of goal "${source.goal.title}" passed its due date` }
            ]
          }
      }
      break

    case enumEvent.gStakeholderAchieverAdded:

      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'person-add-outline',
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` joined as an Achiever` }
            ]
          }
        case 'goal':
          return {
            ...get('user', source),
            icon: 'person-add-outline',
            message: [
              { text: `Joined as an Achiever!`}
            ]
          }
        case 'spectator':
          return {
            ...get('user', source),
            icon: 'person-add-outline',
            message: [
              { text: `Joined goal "` },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `" as an Achiever` }
            ]
          }
        default:
          throwError(event, target);
          break
      }
      break

    case enumEvent.gStakeholderAdminAdded:
      switch (target) {
        case 'goal':
          return {
            ...get('user', source),
            icon: 'person-add-outline',
            message: [
              { text: `Became an admin` }
            ]
          }
        
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'person-add-outline',
            message: [
              { text: `${source.user.username} is now admin` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break
    
    case enumEvent.gStakeholderRequestToJoinPending:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'person-add-outline',
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` requests to join goal` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gStakeholderRequestToJoinAccepted:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            icon: 'person-add-outline',
            message: [
              { text: `Your request to join goal "${source.goal.title}" has been accepted` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gStakeholderRequestToJoinRejected:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            icon: 'person-remove-outline',
            message: [
              { text: `Your request to join "${source.goal.title}" has been rejected` }
            ]
          }
        default:
          throwError(event, target)
          break
      }
      break
    
    case enumEvent.gSupportAdded:
      switch (target) {
        case 'stakeholder': {
          const text = source.support.milestone?.id
          ? ` is now supporting milestone "${source.support.milestone.content}"`
          : ` is now supporting`
        
          return {
            ...get('goal', source),
            icon: 'heart-outline',
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              { text },
              { text: ` with "${source.support.description}"` }
            ]
          }
        }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gSupportWaitingToBePaid:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            icon: 'heart-outline',
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              { text: ` decided to give you the support "${source.support.description}"` }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gSupportPaid:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            icon: 'heart-outline',
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              {
                text: ` paid support "${source.support.description}"`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gSupportRejected:
      switch (target) {
        case 'stakeholder':
          if (source.support.milestone?.id) {
            return {
              ...get('goal', source),
              icon: 'heart-dislike-outline',
              message: [
                {
                  text: source.support.supporter.username,
                  link: `profile/${source.support.supporter.uid}`
                },
                { text: ` rejected paying support "${source.support.description}" for milestone "${source.support.milestone.content}"` }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              icon: 'heart-dislike-outline',
              message: [
                {
                  text: source.support.supporter.username,
                  link: `profile/${source.support.supporter.uid}`
                },
                { text: ` rejected paying support "${source.support.description}"` }
              ]
            }
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gSupportPendingSuccesful:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'checkmark-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" succesfully completed` }
            ]
          }

        default:
          throwError(event, target)
      }
      break

    case enumEvent.gSupportPendingFailed:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'checkmark-outline',
            message: [
              { text: `Milestone "${source.milestone.content}" failed to complete` }
            ]
          }
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gSupportDeleted:
      switch (target) {
        case 'user':

          if (source.milestone.id) {
            return {
              ...get('goal', source),
              icon: 'remove-outline',
              message: [
                { text: `Support "${source.support.description}" has been removed because milestone "${source.milestone.content}" has been deleted` }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              icon: 'remove-outline',
              message: [
                { text: `Support "${source.support.description}" has been removed because goal "${source.goal.title}" has been deleted` }
              ]
            }
          }
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gRoadmapUpdated:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'create-outline',
            message: [
              {
                text: `Roadmap has been changed. Go and checkout what the new plan is."`
              }
            ]
          }

        case 'goal':
          return {
            ...get('goal', source),
            icon: 'create-outline',
            message: [
              {
                text: `Roadmap has been updated`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.gNewPost:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            icon: 'bookmark-outline',
            message: [
              { text: `Post created` }
            ]
          }

        case 'goal':
          return {
            ...get('user', source),
            icon: 'bookmark-outline',
            message: [] // no message - just the post
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.discussionNewMessage:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            icon: 'chatbox-outline',
            message: [
              { text: `New comment "${source.comment.text}" from ${source.comment.user.username}` },
            ]
          }
      
        default:
          throwError(event, target)
          break
      }
      break

    case enumEvent.userSpectatorAdded:
      switch (target) {
        case 'user':
          return {
            ...get('user', source),
            icon: 'person-add-outline',
            message: [
              { text: `${source.user.username} started following you` }
            ]
          }

        default:
          throwError(event, target)
          break
      }
      break

    default:
      // throwError(notification, target);
      return {
        title: 'Unknown notification',
        icon: 'alert-outline',
        image: '',
        link: '',
        message: [] 
      }
  }
}