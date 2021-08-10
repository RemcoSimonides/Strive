import { FieldValue } from '@firebase/firestore-types';

export interface CollectiveGoal {
    id?: string;
    title: string;
    shortDescription: string;
    description: string;
    isPublic: boolean;
    // TODO remove isOverdue field
    isOverdue: boolean;
    deadline: string;
    image: string;
    numberOfAchievers: number;
    updatedBy?: string;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

/** A factory function that creates a CollectiveGoalDocument. */
export function createCollectiveGoal(params: Partial<CollectiveGoal> = {}): CollectiveGoal {
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

export interface CollectiveGoalLink {
  id: string;
  title: string;
  image: string;
}

export function createCollectiveGoalLink(params: Partial<CollectiveGoalLink> = {}): CollectiveGoalLink {
  return {
    id: params.id ?? '',
    title: params.title ?? '',
    image: params.image ?? ''
  }
}