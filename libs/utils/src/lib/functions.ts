import { getApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions'

/** All Cloud Functions run in europe-west1, next to Firestore (eur3) */
export const functionsRegion = 'europe-west1'

export function callable<Req = unknown, Res = unknown>(name: string) {
  return httpsCallable<Req, Res>(getFunctions(getApp(), functionsRegion), name)
}
