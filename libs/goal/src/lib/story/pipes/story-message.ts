import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { GoalEvent, NotificationIcons, NotificationMessageText } from '@strive/model';

export interface StoryItemMessage {
  icon: NotificationIcons
  message: NotificationMessageText[]
}

export function getStoryItemMessage({ name, source }: GoalEvent): StoryItemMessage {
  switch (name) {
    case 'goalCreatedStatusBucketlist':
    case 'goalCreatedStatusActive':
    case 'goalCreatedStatusFinished':
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal created` }]
      }
    case 'goalStatusFinished':
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal is finished!` }]
      }
    case 'goalMilestoneCompletedSuccessfully':
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone!.content}" successfully completed` }
        ]
      }
    case 'goalMilestoneCompletedUnsuccessfully':
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone!.content}" failed to complete` }
        ]
      }
    case 'goalMilestoneDeadlinePassed':
      return {
        icon: 'alert-outline',
        message: [
          { text: `Milestone "${source.milestone!.content}" passed its due date` }
        ]
      }
    case 'goalStakeholderBecameAchiever':
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user!.username, link: `/profile/${source.user!.uid}` },
          { text: ` joined as an Achiever`}
        ]
      }
    case 'goalStakeholderBecameAdmin':
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user!.username, link: `/profile/${source.user!.uid}` },
          { text: ` became an Admin` }
        ]
      }
    case 'goalStoryPostCreated':
      return {
        icon: 'bookmark-outline',
        message: [] // no message - just the post
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