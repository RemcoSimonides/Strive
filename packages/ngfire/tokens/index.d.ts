import { InjectionToken } from '@angular/core';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseOptions, initializeApp, FirebaseApp, FirebaseAppSettings } from 'firebase/app';
import { initializeAuth, Auth, Dependencies } from 'firebase/auth';
import { initializeFirestore, Firestore, FirestoreSettings } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { initializeAnalytics, Analytics, AnalyticsSettings } from 'firebase/analytics';

interface FirebaseConfig {
    options: FirebaseOptions;
    app?: (...params: Parameters<typeof initializeApp>) => FirebaseApp;
    firestore?: (...params: Parameters<typeof initializeFirestore>) => Firestore;
    auth?: (...params: Parameters<typeof initializeAuth>) => Auth;
    storage?: (...params: Parameters<typeof getStorage>) => FirebaseStorage;
    functions?: (...params: Parameters<typeof getFunctions>) => Functions;
    database?: (...params: Parameters<typeof getDatabase>) => Database;
    analytics?: (...params: Parameters<typeof initializeAnalytics>) => Analytics;
}
declare const FIREBASE_APP_SETTINGS: InjectionToken<FirebaseAppSettings>;
declare const FIREBASE_CONFIG: InjectionToken<FirebaseConfig>;
declare const REGION_OR_DOMAIN: InjectionToken<string>;
declare const FIRESTORE_SETTINGS: InjectionToken<FirestoreSettings>;
declare const ANALYTICS_SETTINGS: InjectionToken<AnalyticsSettings>;
declare const STORAGE_BUCKET: InjectionToken<string>;
declare const DB_URL: InjectionToken<string>;
declare const AUTH_DEPS: InjectionToken<Dependencies>;
declare function getConfig(): FirebaseConfig;

export { ANALYTICS_SETTINGS, AUTH_DEPS, DB_URL, FIREBASE_APP_SETTINGS, FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN, STORAGE_BUCKET, getConfig };
export type { FirebaseConfig };
