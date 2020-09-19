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

export interface IBucketList {
    items: IBucketListItem[];
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}

export interface IBucketListItem {
    description: string;
    privacy: enumPrivacy;
    completed: boolean;
}

export enum enumPrivacy {
    public = 'public',
    spectatorsOnly = 'spectatorsOnly',
    private = 'private'
}
