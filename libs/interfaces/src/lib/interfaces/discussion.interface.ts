import { Timestamp } from '@firebase/firestore-types';
import { ISource } from '@strive/notification/+state/notification.firestore'

export interface IDiscussion {
  id?: string;
  title: string;
  audience: enumDiscussionAudience;
  numberOfComments: number;
  commentators: string[];
  source: ISource;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// export interface IMessage {
//   uid: string;
//   content: string;
//   createdAt: Timestamp;
// }

export enum enumDiscussionAudience {
  public,
  stakeholders,
  adminsAndRequestor,
  achievers
}
