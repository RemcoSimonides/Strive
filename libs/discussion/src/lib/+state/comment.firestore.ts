import { Timestamp } from '@firebase/firestore-types';

export interface Comment {
    id?: string;
    text: string;
    type: 'sentByUser' | 'notification';
    uid: string;
    username: string;
    photoURL: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}
