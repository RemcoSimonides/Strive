import { FieldValue } from '@firebase/firestore-types';

export interface User {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    walletBalance: number;
    posts?: { [goalPostId: string ]: true };
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export interface Profile {
  id?: string;
  username: string;
  image: string;
  numberOfSpectating: number;
  numberOfSpectators: number;
  numberOfUnreadNotifications: number;
  fcmTokens?: FieldValue | string[]; // one token per used device
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export interface ProfileLink {
  uid: string,
  username: string,
  image: string
}

export function createProfileLink(params: Partial<ProfileLink> = {}): ProfileLink {
  return {
    uid: '',
    username: '',
    image: '',
    ...params
  }
}