import { Observable } from 'rxjs';
import { UploadTask, UploadTaskSnapshot, UploadMetadata, FirebaseStorage } from 'firebase/storage';
import * as _firebase_storage from '@firebase/storage';
import * as i0 from '@angular/core';
import { InjectionToken } from '@angular/core';

declare function fromTask(task: UploadTask): Observable<UploadTaskSnapshot>;
interface PercentageSnapshot {
    progress: number;
    snapshot: UploadTaskSnapshot;
}
declare function percentage(task: UploadTask): Observable<PercentageSnapshot>;

declare class FireStorage {
    private injector;
    protected bucket?: string;
    protected get storage(): _firebase_storage.FirebaseStorage;
    ref(url: string): _firebase_storage.StorageReference;
    upload(url: string, bytes: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): _firebase_storage.UploadTask;
    static ɵfac: i0.ɵɵFactoryDeclaration<FireStorage, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FireStorage>;
}

declare const FIRE_STORAGE: InjectionToken<FirebaseStorage>;

export { FIRE_STORAGE, FireStorage, fromTask, percentage };
export type { PercentageSnapshot };
