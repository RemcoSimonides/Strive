import { FieldValue } from '@firebase/firestore-types';

export interface IProfile {
    id?: string;
    username: string;
    image: string;
    numberOfSpectating: number;
    numberOfSpectators: number;
    numberOfUnreadNotifications: number;
    fcmTokens?: string[]; // one token per used device
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}
