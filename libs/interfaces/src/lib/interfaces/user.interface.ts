import { FieldValue } from '@firebase/firestore-types';

export interface IUser {
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
