import { enumEvent, Notification, NotificationMessageText, Source, SupportDecisionMeta } from '../+state/notification.firestore';

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

export function getNotificationMessage({ event, source, meta, target }: Notification): { title: string, image: string, link: string, message: NotificationMessageText[] } {
  switch (event) {
    case enumEvent.cgGoalCreated:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            message: [
              { text: `A new goal has been created in collective goal '` },
              { 
                text: source.collectiveGoal.title,
                link: `collective-goal/${source.collectiveGoal.id}`
              },
              { text: `', can you help out?` }
            ]  
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.cgGoalFinised:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            message: [
              { text: `Goal '` },
              { 
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              {
                text: `' is finished!`
              }
            ]
          }
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.cgTemplateAdded:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('collectiveGoal', source),
            message: [
              { text: `New template '` },
              {
                text: source.template.title,
                link: `collective-goal/${source.collectiveGoal.id}/template/${source.template.id}`
              },
              { text: `' has been created` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gNew:

      switch (target) {
        case 'goal':
          return {
            ...get('goal', source),
            message: [
              { text: `New goal is created! Best of luck` }
            ]
          }

        case 'spectator':
          return {
            ...get('user', source),
            message: [
              { text: `Created goal '` },
              { 
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `'. Can you help out?` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gFinished:

      switch (target) {
        case 'goal':
          return {
            ...get('goal', source),
            message: [{ text: `Goal is finished!` }]
          }

        case 'spectator':
          return {
            ...get('user', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` has finished goal '` },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `'` }
            ]
          }

        case 'stakeholder':
          // Can be support decision notification
          if ((meta as SupportDecisionMeta).type === 'supportDecision') {
            return {
              ...get('goal', source),
              message: [
                { text: 'Goal has been completed!' }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              message: [
                { text: `Congratulations! goal '` },
                { 
                  text: source.goal.title,
                  link: `goal/${source.goal.id}`
                },
                {
                  text: `' has been finished.`
                }
              ]
            }
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gMilestoneCompletedSuccessfully:
      switch (target) {
        case 'goal':
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' is successfully completed` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gMilestoneCompletedUnsuccessfully:
      switch (target) {
        case 'goal':
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' failed to complete` }
            ]
          }
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gMilestoneDeadlinePassed:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' of goal '` },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              {
                text: `' has passed the due date`
              }
            ]
          }
        case 'goal':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' has passed the due date` }
            ]
          }
      }

    case enumEvent.gStakeholderAchieverAdded:

      switch (target) {
        case  'stakeholder':
          return {
            ...get('goal', source),
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
            message: [
              { text: `Joined as an Achiever!`}
            ]
          }
        case 'spectator':
          return {
            ...get('user', source),
            message: [
              { text: `Joined goal '` },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              { text: `' as an Achiever` }
            ]
          }
        default:
          throwError(event, target);
          break;
      }

    case enumEvent.gStakeholderAdminAdded:
      switch (target) {
        case 'goal':
          return {
            ...get('user', source),
            message: [
              { text: `Became an Admin` }
            ]
          }
        
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` is now admin` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }
    
    case enumEvent.gStakeholderRequestToJoinPending:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` requests to join, do you accept?` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gStakeholderRequestToJoinAccepted:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            message: [
              { text: `Your request to join has been accepted` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gStakeholderRequestToJoinRejected:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            message: [
              { text: `Your request to join has been rejected` }
            ]
          }
        default:
          throwError(event, target)
          break;
      }
    
    case enumEvent.gSupportAdded:
      switch (target) {
        case 'stakeholder':
          const text = source.support.milestone?.id
            ? ` is now supporting milestone ${source.support.milestone.description}`
            : ` is now supporting`
          
          return {
            ...get('goal', source),
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              { text },
              { text: ` with ${source.support.description}` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gSupportWaitingToBePaid:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              { text: ` is going to give you the support '${source.support.description}' 🙂` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gSupportPaid:
      switch (target) {
        case 'user':
          return {
            ...get('goal', source),
            message: [
              {
                text: source.support.supporter.username,
                link: `profile/${source.support.supporter.uid}`
              },
              {
                text: ` paid support '${source.support.description}'`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gSupportRejected:
      switch (target) {
        case 'stakeholder':
          if (source.support.milestone?.id) {
            return {
              ...get('goal', source),
              message: [
                {
                  text: source.support.supporter.username,
                  link: `profile/${source.support.supporter.uid}`
                },
                { text: ` rejected paying support '${source.support.description}' for milestone '${source.support.milestone.description}' in goal '` },
                {
                  text: source.goal.title,
                  link: `goal/${source.goal.id}`
                },
                { text: `'` }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              message: [
                {
                  text: source.support.supporter.username,
                  link: `profile/${source.support.supporter.uid}`
                },
                { text: ` rejected paying support '${source.support.description}' for goal '` },
                {
                  text: source.support.goal.title,
                  link: `goal/${source.support.goal.id}`
                },
                { text: `'` }
              ]
            }
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gSupportPendingSuccesful:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' is succesfully completed 🎉` }
            ]
          }

        default:
          throwError(event, target)
      }

    case enumEvent.gSupportPendingFailed:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              { text: `Milestone '${source.milestone.description}' has failed to complete` }
            ]
          }
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gSupportDeleted:
      switch (target) {
        case 'user':

          if (source.milestone.id) {
            return {
              ...get('goal', source),
              message: [
                { text: `Support '${source.support.description}' has been removed because milestone '${source.milestone.description}' has been deleted` }
              ]
            }
          } else {
            return {
              ...get('goal', source),
              message: [
                { text: `Support '${source.support.description}' has been removed because goal '${source.goal.title}' has been deleted` }
              ]
            }
          }
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gRoadmapUpdated:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              {
                text: `Roadmap of goal '`
              },
              {
                text: source.goal.title,
                link: `goal/${source.goal.id}`
              },
              {
                text: `' has been changed. Go and checkout what the new plan is.`
              }
            ]
          }

        case 'goal':
          return {
            ...get('goal', source),
            message: [
              {
                text: `Roadmap has been updated`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.gNewPost:
      switch (target) {
        case 'stakeholder':
          return {
            ...get('goal', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` just created a new post` }
            ]
          }

        case 'goal':
          return {
            ...get('user', source),
            message: [] // no message - just the post
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.discussionNewMessage:
      switch (target) {
        case 'user':
          return {
            ...get('user', source),
            message: [
              { text: `New comment '${source.comment.text}' from ` },
              {
                text: source.comment.user.username,
                link: `profile/${source.comment.user.uid}`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.userSpectatorAdded:
      switch (target) {
        case 'user':
          return {
            ...get('user', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              { text: ` is now following you` }
            ]
          }

        default:
          throwError(event, target)
          break;
      }

    case enumEvent.userExerciseBucketListCreated:
      switch (target) {
        case 'spectator':
          return {
            ...get('user', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              {
                text: ` has created a Bucket List! Can you help with some of the items on it?`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

      case enumEvent.userExerciseBucketListItemsAdded:
        switch (target) {
          case 'spectator':
            let text = 'has added '
            const descriptions = source.bucketList.map(item => `'${item.description}'`)
            if (descriptions.length === 1) {
              text += descriptions[0]
            } else {
              descriptions.forEach((description, index) => {
                if (index === 0) {
                  text += description
                } else if (index === descriptions.length - 1) {
                  text += ` and ${description}`
                } else {
                  text += `, ${description}`
                }
              })
            }

            return {
              ...get('user', source),
              message: [
                {
                  text: source.user.username,
                  link: `profile/${source.user.uid}`
                },
                { text: ` ${text} to his/her Bucket List. Maybe you can help?` }
              ]
            }
        
          default:
            throwError(event, target)
            break;
        }

    case enumEvent.userExerciseBucketListItemCompleted:
      switch (target) {
        case 'spectator':
          return {
            ...get('user', source),
            message: [
              {
                text: source.user.username,
                link: `profile/${source.user.uid}`
              },
              {
                text: ` ticked off '${source.bucketList[0].description}' from his/her Bucket List!`
              }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    case enumEvent.userExerciseBucketListYearlyReminder:
      switch (target) {
        case 'user':
          return {
            title: 'Your Bucketlist',
            image: 'assets/exercises/bucketlist/bucketlist.jpg',
            link: `/profile/${source.user.uid}`,
            message: [
              { text: `It's been a year since you last updated your Bucket List. How is it going?  Are you still focussed in life in completing this list? Or does it need an update? Schedule a moment for yourself to review` }
            ]
          }
      
        default:
          throwError(event, target)
          break;
      }

    default:
      // throwError(notification, target);
      return {
        title: 'Unknown notification',
        image: '',
        link: '',
        message: [] 
      }
  }
}