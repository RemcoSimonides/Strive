import { initializeAuth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const authEmulator = (...emulatorParams) => {
    return (app, deps) => {
        const auth = deps ? initializeAuth(app, deps) : getAuth(app);
        connectAuthEmulator(auth, ...emulatorParams);
        return auth;
    };
};

const databaseEmulator = (...emulatorParams) => {
    return (...params) => {
        const database = getDatabase(...params);
        connectDatabaseEmulator(database, ...emulatorParams);
        return database;
    };
};

const firestoreEmulator = (...emulatorParams) => {
    return (...params) => {
        const firestore = initializeFirestore(...params);
        connectFirestoreEmulator(firestore, ...emulatorParams);
        return firestore;
    };
};

const functionsEmulator = (...emulatorParams) => {
    return (...params) => {
        const functions = getFunctions(...params);
        connectFunctionsEmulator(functions, ...emulatorParams);
        return functions;
    };
};

const storageEmulator = (...emulatorParams) => {
    return (...params) => {
        const storage = getStorage(...params);
        connectStorageEmulator(storage, ...emulatorParams);
        return storage;
    };
};

/**
 * Generated bundle index. Do not edit.
 */

export { authEmulator, databaseEmulator, firestoreEmulator, functionsEmulator, storageEmulator };
//# sourceMappingURL=ngfire-emulators.mjs.map
