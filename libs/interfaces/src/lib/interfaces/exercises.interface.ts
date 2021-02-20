import { FieldValue } from '@firebase/firestore-types';

export interface IDailyGratefulness {
    on: boolean;
    time: string;
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}
