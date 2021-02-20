import { FieldValue } from '@firebase/firestore-types';

export interface Spectator {
  id?: string;
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
    id: !!params.id ? params.id : '',
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