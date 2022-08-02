import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { enumEvent, GoalEvent, NotificationIcons, NotificationMessageText } from '@strive/model';

export interface StoryItemMessage {
  icon: NotificationIcons
  message: NotificationMessageText[]
}

export function getStoryItemMessage({ name, source }: GoalEvent): StoryItemMessage {
  switch (name) {
    case enumEvent.gNewBucketlist:
    case enumEvent.gNewActive:
    case enumEvent.gNewFinished:
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal created` }]
      }
    case enumEvent.gFinished:
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal is finished!` }]
      }
    case enumEvent.gMilestoneCompletedSuccessfully:
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" successfully completed` }
        ]
      }
    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" failed to complete` }
        ]
      }
    case enumEvent.gMilestoneDeadlinePassed:
      return {
        icon: 'alert-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" passed its due date` }
        ]
      }
    case enumEvent.gStakeholderAchieverAdded:
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` joined as an Achiever`}
        ]
      }
    case enumEvent.gStakeholderAdminAdded:
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` became an Admin` }
        ]
      }
    case enumEvent.gRoadmapUpdated:
      return {
        icon: 'create-outline',
        message: [
          {
            text: `Roadmap has been updated`
          }
        ]
      }
    case enumEvent.gNewPost:
      return {
        icon: 'bookmark-outline',
        message: [] // no message - just the post
      }
    case enumEvent.gSupportAdded: {
      const isMilestone = source.milestone?.id
      const suffix = isMilestone ? ` to milestone "${source.milestone.content}" ` : ''
      return {
        icon: 'heart-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` added support "${source.support.description}"${suffix}`}
        ]
      }
    }
    default:
      return {
        icon: 'alert-outline',
        message: [] 
      }
  }
}

@Pipe({ name: 'storyMessage'})
export class StoryItemMessagePipe implements PipeTransform {
  transform(event: GoalEvent): StoryItemMessage {
    return getStoryItemMessage(event)
  }
}

@NgModule({
  exports: [StoryItemMessagePipe],
  declarations: [StoryItemMessagePipe]
})
export class StoryItemMessagePipeModule { } 