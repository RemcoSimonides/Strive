import { Timestamp } from '@firebase/firestore-types';
import { ISource } from '@strive/notification/+state/notification.firestore'

export type AudienceType = 'public' | 'stakeholders' | 'adminsAndRequestor' | 'achievers'

export interface Discussion {
  id?: string;
  title: string;
  audience: AudienceType;
  numberOfComments: number;
  commentators: string[];
  source: ISource;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
