import { FieldValue } from '@firebase/firestore-types';

export interface Affirmations {
  id?: string;
  times: string[];
  affirmations: string[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}

