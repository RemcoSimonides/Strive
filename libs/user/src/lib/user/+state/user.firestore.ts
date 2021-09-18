import { FieldValue } from '@firebase/firestore-types';

export interface User {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    // dateOfBirth?: string;
    // walletBalance: number;
    // posts?: { [goalPostId: string ]: true };
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export function createUser(params: Partial<User> = {}): User {
  return {
    uid: '',
    email: '',
    firstName: '',
    lastName: '',
    // dateOfBirth: '',
    // walletBalance: 0
    // posts: [],
    ...params
  }
}

export interface Profile {
  uid: string;
  username: string;
  photoURL: string;
  numberOfSpectating: number;
  numberOfSpectators: number;
  fcmTokens: string[]; // one token per used device
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export function createProfile(params: Partial<Profile> = {}): Profile {
  return {
    uid: '',
    username: '',
    photoURL: '',
    numberOfSpectating: 0,
    numberOfSpectators: 0,
    fcmTokens: [],
    ...params
  }
}

export interface ProfileLink {
  uid: string,
  username: string,
  photoURL: string
}

export function createProfileLink(params: Partial<ProfileLink> = {}): ProfileLink {
  return {
    uid: params.uid ?? '',
    username: params.username ?? '',
    photoURL: params.photoURL ?? ''
  }
}