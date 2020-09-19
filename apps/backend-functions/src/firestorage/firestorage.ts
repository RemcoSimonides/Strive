import { db, functions, gcs } from '../internals/firebase';

export const imagesUploadedHandler = functions.storage
    .object()
    .onFinalize(async (object) => {
        const bucket = gcs.bucket(object.bucket)
        const filePath = object.name
        if (!filePath) return
        const fileName = filePath.split('/').pop()
        if (!fileName) return

        if (filePath.includes('Profiles')) {

            let downloadURL = ''
            const uid = filePath.split('/')[1]
            const profileRef = db.doc(`Users/${uid}/Profile/${uid}`)

            if (fileName.includes('_300x300') ) {

                await bucket.file(filePath).getSignedUrl({action: 'read', expires: Date.now() + 3600}).then(urls => {
                    downloadURL = urls[0]
                })

                await profileRef.update({
                    image300x300: downloadURL
                })
            }
        }

    })
