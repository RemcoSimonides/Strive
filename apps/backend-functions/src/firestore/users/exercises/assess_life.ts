import { onDocumentCreate } from '@strive/api/firebase'

export const assessLifeCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/AssessLife`, 'assessLifeCreatedHandler',
async (snapshot, context) => {

  // TO DO
  // Sync gratitude with gratitude journal
  // Sync wheel of life with wheel of life
  // Sync dear future self with dear future self

})