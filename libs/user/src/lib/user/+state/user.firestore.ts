import { FieldValue } from '@firebase/firestore-types';

export interface User {
    id?: string;
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
    id: !!params.id ? params.id : '',
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
  id?: string;
  username: string;
  photoURL: string;
  numberOfSpectating: number;
  numberOfSpectators: number;
  numberOfUnreadNotifications: number;
  fcmTokens?: FieldValue | string[]; // one token per used device
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export function createProfile(params: Partial<Profile> = {}): Profile {
  return {
    id: !!params.id ? params.id : '',
    username: '',
    photoURL: 'assets/img/avatar/blank-profile-picture_512_thumb.png',
    numberOfSpectating: 0,
    numberOfSpectators: 0,
    numberOfUnreadNotifications: 0,
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
    uid: '',
    username: '',
    photoURL: '',
    ...params
  }
}