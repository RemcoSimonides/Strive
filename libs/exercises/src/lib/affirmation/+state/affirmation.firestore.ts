import { FieldValue } from '@firebase/firestore-types';

export interface Affirmations {
  times: string[];
  affirmations: string[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}