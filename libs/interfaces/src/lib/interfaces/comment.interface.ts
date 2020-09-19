import { Timestamp } from '@firebase/firestore-types';

export interface IComment {
    id?: string;
    text: string;
    type: enumCommentType;
    uid: string;
    username: string;
    photoURL: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export enum enumCommentType {
    sentByUser,
    notification
}
