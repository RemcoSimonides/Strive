import { Timestamp } from '@firebase/firestore-types';

export interface Post {
  id?: string;
  isEvidence: boolean;
  title: string;
  description: string;
  mediaURL: string;
  goalId?: string; // only for custom post
  uid?: string; // only for custom post
  milestoneId?: string; // link to milestone
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

/** A factory function that creates a PostDocument. */
export function createPost(params: Partial<Post> = {}): Post {
  return {
    id: params.id ? params.id : '',
    title: '',
    description: '',
    mediaURL: '',
    isEvidence: false,
    ...params
  }
} 