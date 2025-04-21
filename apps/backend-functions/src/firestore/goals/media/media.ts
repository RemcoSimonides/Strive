import { gcsBucket, onDocumentDelete } from '@strive/api/firebase'
import { createMedia } from '@strive/model'
import { toDate } from '../../../shared/utils'

export const mediaDeletedHandler = onDocumentDelete(`Goals/{goalId}/Media/{mediaId}`,
async (snapshot) => {
  const media = createMedia(toDate({ ...snapshot.data, id: snapshot.id }))

  const fileRef = `${media.storagePath}/${media.id}`
  gcsBucket.file(fileRef).delete({ ignoreNotFound: true })
})