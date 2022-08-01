import { createUserLink, UserLink } from '@strive/model'

export interface Comment {
    id?: string;
    text: string;
    type: 'sentByUser' | 'notification';
    user: UserLink;
    createdAt?: Date;
    updatedAt?: Date;
}

export function createComment(params: Partial<Comment> = {}): Comment {
  return {
    text: '',
    type: 'notification',
    user: createUserLink(),
    ...params
  }
}