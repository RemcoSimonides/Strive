import { FieldValue } from '@firebase/firestore-types';

export interface BucketList {
  items: BucketListItem[];
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}

export interface BucketListItem {
  description: string;
  privacy: 'public' | 'spectatorsOnly' | 'private';
  completed: boolean;
}

export function createBucketListItem(params: Partial<BucketListItem> = {}): BucketListItem {
  return {
    description: '',
    privacy: 'public',
    completed: false,
    ...params
  }
}