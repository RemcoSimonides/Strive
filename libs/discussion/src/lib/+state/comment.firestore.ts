import { Timestamp } from '@firebase/firestore-types';
import { createUserLink, UserLink } from '@strive/user/user/+state/user.firestore';

export interface Comment {
    id?: string;
    text: string;
    type: 'sentByUser' | 'notification';
    user: UserLink;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export function createComment(params: Partial<Comment> = {}): Comment {
  return {
    text: '',
    type: 'notification',
    user: createUserLink(),
    ...params
  }
}