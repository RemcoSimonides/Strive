import { Timestamp } from '@firebase/firestore-types';

export enum enumPostSource {
    milestone,
    goal,
    collectiveGoal,
    custom
}

export interface Post {
  id?: string;
  isEvidence: boolean;
  author: {
    id: string;
    username: string;
    profileImage: string;
  };
  content: {
    title: string;
    description: string;
    mediaURL?: string;
  };
  goal: {
    id: string;
    title: string;
    image: string;
  };
  milestone: {
    id: string;
    description: string;
  };
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

/** A factory function that creates a PostDocument. */
export function createPost(params: Partial<Post> ={}): Post {
  return {
    id: !!params.id ? params.id : '',
    author: {
      id: '',
      profileImage: '',
      username: ''
    },
    content: {
      title: '',
      description: '',
      mediaURL: '',
    },
    goal: {
      id: '',
      title: '',
      image: ''
    },
    milestone: {
      id: '',
      description: ''
    },
    isEvidence: false,
    ...params
  }
} 