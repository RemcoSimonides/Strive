import { FieldValue } from '@firebase/firestore-types';

export interface ICollectiveGoal {
    id?: string;
    title: string;
    shortDescription: string;
    description: string;
    isPublic: boolean;
    isOverdue: boolean;
    deadline: string;
    image: string;
    numberOfAchievers: number;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}
