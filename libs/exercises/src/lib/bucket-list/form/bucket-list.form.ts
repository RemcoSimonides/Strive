import { FormControl } from "@angular/forms";
import { FormEntity } from '@strive/utils/form/entity.form';
import { BucketListItem, createBucketListItem } from "../+state/bucket-list.firestore";

function createBucketListItemControl(item: Partial<BucketListItem> = {}) {
  const entity = createBucketListItem(item);
  return {
    description: new FormControl(entity.description),
    privacy: new FormControl(entity.privacy),
    completed: new FormControl(entity.completed)
  }
}

type BucketListItemControl = ReturnType<typeof createBucketListItemControl>

export class BucketListItemForm extends FormEntity<BucketListItemControl> {
  constructor(item?: Partial<BucketListItem>) {
    super(createBucketListItemControl(item))
  }
}