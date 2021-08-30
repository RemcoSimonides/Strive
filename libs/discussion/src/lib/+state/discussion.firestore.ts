import { Timestamp } from '@firebase/firestore-types';
import { Source } from '@strive/notification/+state/notification.firestore'

export type AudienceType = 'public' | 'collectiveGoal' | 'team' | 'adminsAndRequestor' | 'achievers' | 'spectators'

export interface Discussion {
  id?: string;
  title: string;
  audience: AudienceType;
  numberOfComments: number;
  commentators: string[];
  source: Source;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export function createDiscussion(params: Partial<Discussion> = {}): Discussion {
  return {
    id: params.id ?? '',
    title: '',
    audience: 'public',
    numberOfComments: 0,
    commentators: [],
    source: {},
    ...params
  }
}