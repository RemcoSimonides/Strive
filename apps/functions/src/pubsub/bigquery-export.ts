import { logger, onSchedule, gcs } from '@strive/api/firebase'
import { v1 } from '@google-cloud/firestore'
import { BigQuery } from '@google-cloud/bigquery'

// Replaces the firestore-bigquery-export extension (Firebase Extensions shuts down 31 March 2027).
// Nightly: managed Firestore export to Cloud Storage, then one BigQuery table per collection group, overwritten each run.

// Collection groups, so subcollections are exported across all parents (e.g. every Goals/{id}/Posts).
// Deliberately left out: Personal (emails, FCM tokens), Notifications, Exercises/Entries (private journaling),
// ChatGPT, InviteTokens, ApiKeys, OAuthTokens, Strava.
const collectionIds = ['Goals', 'GStakeholders', 'Milestones', 'Posts', 'Comments', 'Supports', 'Story', 'Users', 'Spectators', 'GoalEvents']

// Firestore lives in eur3; the bucket and dataset must be in the EU multi-region for export and load to work
const location = 'EU'
// firestore_export (US) holds the old extension's changelog history; loads from an EU export can't go there
const datasetId = 'firestore_snapshots'
const keepExportsForDays = 7

export const bigQueryExport = onSchedule('0 3 * * *', async () => {
  const projectId = process.env['GCLOUD_PROJECT']
  const bucket = gcs.bucket(`${projectId}-firestore-exports`)
  const bigquery = new BigQuery({ projectId })
  const dataset = bigquery.dataset(datasetId, { location })

  const [bucketExists] = await bucket.exists()
  if (!bucketExists) {
    await bucket.create({ location, lifecycle: { rule: [{ action: { type: 'Delete' }, condition: { age: keepExportsForDays } }] } })
  }

  const [datasetExists] = await dataset.exists()
  if (!datasetExists) await dataset.create({ location })

  // full timestamp: Firestore refuses to export into a folder that already holds an export, so a rerun on the same day needs its own
  const prefix = new Date().toISOString().replace(/[:.]/g, '-')
  const client = new v1.FirestoreAdminClient()
  const [operation] = await client.exportDocuments({
    name: client.databasePath(projectId, '(default)'),
    outputUriPrefix: `gs://${bucket.name}/${prefix}`,
    collectionIds
  })
  await operation.promise()

  const results = await Promise.allSettled(collectionIds.map(id => {
    const file = bucket.file(`${prefix}/all_namespaces/kind_${id}/all_namespaces_kind_${id}.export_metadata`)
    return dataset.table(id).load(file, { sourceFormat: 'DATASTORE_BACKUP', writeDisposition: 'WRITE_TRUNCATE' })
  }))

  const failed = results.flatMap((result, i) => result.status === 'rejected' ? [collectionIds[i]] : [])
  results.forEach((result, i) => {
    if (result.status === 'rejected') logger.error(`BigQuery load failed for ${collectionIds[i]}`, result.reason)
  })
  if (failed.length) throw new Error(`BigQuery load failed for: ${failed.join(', ')}`)
}, { region: 'europe-west1', timeoutSeconds: 540, memory: '512MiB' })
