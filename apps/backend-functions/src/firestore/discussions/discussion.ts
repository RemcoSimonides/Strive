import { db, functions } from '../../internals/firebase';

import { deleteCollection } from '../../shared/utils';

export const discussionDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onDelete(async snapshot => {

    const discussionId = snapshot.id

    //delete subcollections too
    deleteCollection(db, `Discussions/${discussionId}/Comments`, 500)
    
  })
