import { gcsBucket, onDocumentDelete } from '@strive/api/firebase'
import { createMedia } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { videoOutputPaths } from '../../../shared/video/transcode'

export const mediaDeletedHandler = onDocumentDelete(`Goals/{goalId}/Media/{mediaId}`,
async (snapshot) => {
  const media = createMedia(toDate({ ...snapshot.data.data(), id: snapshot.params.mediaId }))

  const fileRef = `${media.storagePath}/${media.id}`
  const files = media.fileType === 'video' ? [fileRef, ...Object.values(videoOutputPaths(fileRef))] : [fileRef]
  await Promise.all(files.map(file => gcsBucket.file(file).delete({ ignoreNotFound: true })))
})