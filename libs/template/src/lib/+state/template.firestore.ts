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
