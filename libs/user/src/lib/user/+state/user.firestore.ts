import { FieldValue } from '@firebase/firestore-types';

export interface Personal {
    uid: string;
    email: string;
    fcmTokens: string[]; // one token per used device
    // walletBalance: number;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export function createPersonal(params: Partial<Personal> = {}): Personal {
  return {
    uid: '',
    email: '',
    fcmTokens: [],
    // walletBalance: 0
    ...params
  }
}

export interface User {
  uid: string;
  username: string;
  photoURL: string;
  numberOfSpectating: number;
  numberOfSpectators: number;
  numberOfActiveGoals: number;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export function createUser(params: Partial<User> = {}): User {
  return {
    uid: '',
    username: '',
    photoURL: '',
    numberOfSpectating: 0,
    numberOfSpectators: 0,
    numberOfActiveGoals: 0,
    ...params
  }
}

export interface UserLink {
  uid: string,
  username: string,
  photoURL: string
}

export function createUserLink(params: Partial<UserLink> = {}): UserLink {
  return {
    uid: params.uid ?? '',
    username: params.username ?? '',
    photoURL: params.photoURL ?? ''
  }
}