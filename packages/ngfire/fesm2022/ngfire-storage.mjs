import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { InjectionToken, inject, Injector, Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, STORAGE_BUCKET } from 'ngfire/tokens';

function fromTask(task) {
    return new Observable((subscriber) => {
        const progress = (snap) => subscriber.next(snap);
        const error = (e) => subscriber.error(e);
        const complete = () => subscriber.complete();
        // emit the current state of the task
        progress(task.snapshot);
        // emit progression of the task
        const unsubscribeFromOnStateChanged = task.on('state_changed', progress);
        // use the promise form of task, to get the last success snapshot
        task.then((snapshot) => {
            progress(snapshot);
            setTimeout(() => complete(), 0);
        }, (e) => {
            progress(task.snapshot);
            setTimeout(() => error(e), 0);
        });
        // the unsubscribe method returns by storage isn't typed in the
        // way rxjs expects, Function vs () => void, so wrap it
        return function unsubscribe() {
            unsubscribeFromOnStateChanged();
        };
    }).pipe(
    // since we're emitting first the current snapshot and then progression
    // it's possible that we could double fire synchronously; namely when in
    // a terminal state (success, error, canceled). Debounce to address.
    debounceTime(0));
}
function percentage(task) {
    return fromTask(task).pipe(map((snapshot) => ({
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        snapshot,
    })));
}

const FIRE_STORAGE = new InjectionToken('Firebase Storage', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const app = inject(FIREBASE_APP);
        const bucket = inject(STORAGE_BUCKET, { optional: true });
        if (config.storage) {
            return config.storage(app, bucket ?? undefined);
        }
        else {
            return getStorage(app, bucket ?? undefined);
        }
    },
});

class FireStorage {
    injector = inject(Injector);
    bucket;
    get storage() {
        return this.injector.get(FIRE_STORAGE);
    }
    ref(url) {
        return ref(this.storage, url);
    }
    upload(url, bytes, metadata) {
        const ref = this.ref(url);
        return uploadBytesResumable(ref, bytes, metadata);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireStorage, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireStorage, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireStorage, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { FIRE_STORAGE, FireStorage, fromTask, percentage };
//# sourceMappingURL=ngfire-storage.mjs.map
