import { FieldValue } from '@firebase/firestore-types';
import { Timestamp } from 'firebase/firestore';

export interface Message {
  description: string;
  deliveryDate: Date | Timestamp;
  createdAt: Date | Timestamp;
}

export interface DearFutureSelf {
  id?: string;
  messages: Message[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}
