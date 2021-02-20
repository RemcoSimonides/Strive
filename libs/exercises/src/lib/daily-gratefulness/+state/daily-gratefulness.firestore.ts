import { FieldValue } from '@firebase/firestore-types';

export interface DailyGratefulness {
  on: boolean;
  time: string;
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}
