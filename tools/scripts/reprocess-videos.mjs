// One-off: run every existing post video through the videoUploadedHandler function again.
// Copying a Storage object onto itself makes a new generation, which fires the upload trigger.
// Uses the REST APIs with the token of the account gcloud is logged in with.
//
//   node tools/scripts/reprocess-videos.mjs            # dry run: lists what it would do
//   node tools/scripts/reprocess-videos.mjs --apply    # does it
import { execSync } from 'node:child_process'

const apply = process.argv.includes('--apply')
const projectId = process.env.STRIVE_PROJECT ?? 'strive-journal'
const bucket = `${projectId}.appspot.com`
const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim()
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
const STORAGE = `https://storage.googleapis.com/storage/v1/b/${bucket}/o`

async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': projectId, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${await res.text()}`)
  return res.json()
}

const EXTENSION_TYPES = { mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/x-m4v', webm: 'video/webm', '3gp': 'video/3gpp' }

// all Media docs, filtered here: a fileType filter on the collection group would need an extra index
const rows = await call('POST', `${FIRESTORE}:runQuery`, { structuredQuery: { from: [{ collectionId: 'Media', allDescendants: true }] } })
const videos = rows.filter(row => row.document?.fields?.fileType?.stringValue === 'video').map(row => row.document)
console.log(`${videos.length} video media in ${projectId}${apply ? '' : ' (dry run, pass --apply to reprocess)'}`)

for (const doc of videos) {
  const id = doc.name.split('/').pop()
  const fields = doc.fields
  const path = `${fields.storagePath.stringValue}/${id}`
  const object = await call('GET', `${STORAGE}/${encodeURIComponent(path)}`)
  if (!object) {
    console.log(`  skip ${path}: original is gone`)
    continue
  }
  const extension = (fields.fileName?.stringValue ?? '').split('.').pop()?.toLowerCase()
  const contentType = object.contentType?.startsWith('video/') ? object.contentType : EXTENSION_TYPES[extension] ?? 'video/mp4'
  console.log(`  ${apply ? 'reprocess' : 'would reprocess'} ${path} (${contentType}, ${Math.round(Number(object.size) / 1024)} KB, status ${fields.status?.stringValue})`)
  if (!apply) continue

  // the trigger only handles objects that carry their mediaId, which older uploads may lack
  const encoded = encodeURIComponent(path)
  await call('POST', `${STORAGE}/${encoded}/rewriteTo/b/${bucket}/o/${encoded}`, {
    contentType,
    metadata: { ...object.metadata, mediaId: id },
  })
  await call('PATCH', `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=status`, { fields: { status: { stringValue: 'uploading' } } })
}
