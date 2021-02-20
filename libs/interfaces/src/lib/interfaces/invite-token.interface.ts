import { FieldValue } from '@firebase/firestore-types';

export interface IInviteToken {
  token: string;
  deadline: string;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}