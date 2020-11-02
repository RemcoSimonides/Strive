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

/** A factory function that creates a CollectiveGoalDocument. */
export function createCollectiveGoal(params: Partial<ICollectiveGoal> = {}): ICollectiveGoal {
  return {
    id: !!params.id ? params.id : '',
    deadline: '',
    description: '',
    image: '',
    isOverdue: false,
    isPublic: false,
    numberOfAchievers: 0,
    shortDescription: '',
    title: '',
    ...params
  }
}
