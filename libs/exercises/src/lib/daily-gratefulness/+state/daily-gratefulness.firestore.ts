import { FieldValue } from '@firebase/firestore-types';

export interface DailyGratefulness {
  id?: string;
  on: boolean;
  time: Date;
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}
