import { FieldValue } from '@firebase/firestore-types';

// TODO rework to record on Profile
export interface Spectator {
  uid: string;
  username: string;
  photoURL: string;
  isSpectator: boolean;
  profileId: string;
  profileUsername: string;
  profilePhotoURL: string;
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}

//** A factory function that creates a SpectatorDocument */
export function createSpectator(params: Partial<Spectator> = {}): Spectator {
  return {
    uid: '',
    photoURL: '',
    username: '',
    isSpectator: false,
    profileId: '',
    profilePhotoURL: '',
    profileUsername: '',
    ...params
  }
}