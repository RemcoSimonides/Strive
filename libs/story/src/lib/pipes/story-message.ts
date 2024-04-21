import { Pipe, PipeTransform } from '@angular/core'
import { captureException } from '@sentry/capacitor'
import { NotificationIcons, NotificationMessageText, StoryItem } from '@strive/model'

export interface StoryItemMessage {
  icon: NotificationIcons
  message: NotificationMessageText[]
}

const empty: StoryItemMessage = {
  icon: 'alert-outline',
  message: []
}
function throwError(item: StoryItem) {
  captureException(`Story Item doesn't have required information for message ${JSON.stringify(item)}`)
  return empty
}

export function getStoryItemMessage(item: StoryItem): StoryItemMessage {
  const { name, user, milestone } = item
  switch (name) {
    case 'goalCreated':
    case 'goalCreatedFinished':
      if (!user) return throwError(item)

      return {
        icon: 'flag-outline',
        message: [
          { text: `Goal created by ` },
          { text: user.username, link: `/profile/${user.uid}` }
        ]
      }
    case 'goalFinishedSuccessfully':
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal is finished!` }]
      }
    case 'goalFinishedUnsuccessfully':
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal finished unsuccessfully` }]
      }
    case 'goalMilestoneCompletedSuccessfully':
      if (!milestone) return throwError(item)

      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${milestone.content}" successfully completed` }
        ]
      }
    case 'goalMilestoneCompletedUnsuccessfully':
      if (!milestone) return throwError(item)

      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${milestone.content}" failed to complete` }
        ]
      }
    case 'goalStakeholderBecameAchiever':
      if (!user) return throwError(item)

      return {
        icon: 'person-add-outline',
        message: [
          { text: user.username, link: `/profile/${user.uid}` },
          { text: ` joined as an Achiever`}
        ]
      }
    case 'goalStakeholderBecameAdmin':
      if (!user) return throwError(item)

      return {
        icon: 'person-add-outline',
        message: [
          { text: user.username, link: `/profile/${user.uid}` },
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

@Pipe({ name: 'storyMessage', standalone: true })
export class StoryItemMessagePipe implements PipeTransform {
  transform(item: StoryItem): StoryItemMessage {
    return getStoryItemMessage(item)
  }
}
