import { FieldValue } from '@firebase/firestore-types';

export interface IAffirmations {
    times: string[];
    affirmations: string[];
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}

export interface IDailyGratefulness {
    on: boolean;
    time: string;
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}
