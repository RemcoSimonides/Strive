import { FieldValue } from '@firebase/firestore-types';

export interface DailyGratefulness {
  id?: string;
  on: boolean;
  time: string;
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}
