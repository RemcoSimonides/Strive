import { MilestoneTemplabeObject } from '@strive/milestone/+state/milestone.firestore'
import { FieldValue } from '@firebase/firestore-types';

export interface Template {
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
  milestoneTemplateObject: MilestoneTemplabeObject[];
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

/** A factory function that creates a TemplateDocument */
export function createTemplate(params: Partial<Template> = {}): Template {
  return {
    id: !!params.id ? params.id : '',
    description: '',
    title: '',
    numberOfTimesUsed: 0,
    deadline: '',
    milestoneTemplateObject: [],
    goalTitle: '',
    goalDescription: '',
    goalDeadline: '',
    goalImage: '',
    goalIsPublic: false,
    goalShortDescription: '',
    ...params
  }
}