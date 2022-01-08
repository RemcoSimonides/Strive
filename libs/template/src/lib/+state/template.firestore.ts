import { MilestoneTemplate } from '@strive/goal/milestone/+state/milestone.firestore'
import { FieldValue } from '@firebase/firestore-types';

export interface Template {
  id?: string;
  title: string;
  description: string;
  deadline: string;
  numberOfTimesUsed: number;
  goalTitle: string;
  goalDescription: string;
  goalImage: string;
  goalIsSecret: boolean;
  goalDeadline: string;
  roadmapTemplate: MilestoneTemplate[];
  updatedBy?: string;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

/** A factory function that creates a TemplateDocument */
export function createTemplate(params: Partial<Template> = {}): Template {
  return {
    id: params.id ? params.id : '',
    description: '',
    title: '',
    numberOfTimesUsed: 0,
    deadline: '',
    roadmapTemplate: [],
    goalTitle: '',
    goalDescription: '',
    goalDeadline: '',
    goalImage: '',
    goalIsSecret: false,
    ...params
  }
}

export interface TemplateLink {
  id: string;
  title: string;
  image: string;
}

export function createTemplateLink(params: Partial<Template> = {}): TemplateLink {
  return {
    id: params.id ?? '',
    title: params.title ?? '',
    image: params.goalImage ?? ''
  }
}