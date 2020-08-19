import { IMilestoneTemplabeObject } from './milestone.interface';
import { FieldValue } from '@firebase/firestore-types';

export interface ITemplate {
    id?: string;
    title: string;
    description: string;
    deadline: string;
    numberOfTimesUsed: number;
    goalTitle: string;
    goalShortDescription: string;
    goalDescription: string;
    goalImage: string;
    goalIsPublic: boolean;
    goalDeadline: string;
    milestoneTemplateObject: IMilestoneTemplabeObject[];
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}
