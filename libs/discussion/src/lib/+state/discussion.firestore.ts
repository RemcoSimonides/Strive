import { DiscussionSource } from '@strive/model'

export type AudienceType = 'public' | 'team' | 'adminsAndRequestor' | 'achievers' | 'spectators'

export interface Discussion {
  id?: string;
  title: string;
  audience: AudienceType;
  numberOfComments: number;
  commentators: string[];
  source: DiscussionSource;
  createdAt?: Date;
  updatedAt?: Date;
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