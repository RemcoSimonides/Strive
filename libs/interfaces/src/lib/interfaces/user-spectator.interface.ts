import { FieldValue } from '@firebase/firestore-types';

export interface ISpectator {
    id?: string;
    uid: string;
    username: string;
    photoURL: string;
    isSpectator: boolean;
    profileId: string;
    profileUsername: string;
    profilePhotoURL: string;
    createdAt: FieldValue;
    updatedAt: FieldValue;
}
