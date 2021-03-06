import { Timestamp } from '@firebase/firestore-types';
import { createGoalLink, GoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { createMilestoneLink, MilestoneLink } from '@strive/milestone/+state/milestone.firestore';
import { createProfileLink, ProfileLink } from '@strive/user/user/+state/user.firestore';

export interface Post {
  id?: string;
  isEvidence: boolean;
  content: {
    title: string;
    description: string;
    mediaURL?: string;
  };
  author: ProfileLink;
  goal: GoalLink;
  milestone: MilestoneLink;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

/** A factory function that creates a PostDocument. */
export function createPost(params: Partial<Post> = {}): Post {
  return {
    id: !!params.id ? params.id : '',
    author: createProfileLink(),
    content: {
      title: '',
      description: '',
      mediaURL: '',
    },
    goal: createGoalLink(),
    milestone: createMilestoneLink(),
    isEvidence: false,
    ...params
  }
} 