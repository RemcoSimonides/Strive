import * as i0 from '@angular/core';
import { InjectionToken, inject, PLATFORM_ID, Injector, NgZone, Injectable } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { getDoc, doc, writeBatch, runTransaction } from 'firebase/firestore';
import { onIdTokenChanged, initializeAuth, getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signInWithCustomToken, getAdditionalUserInfo, signOut } from 'firebase/auth';
import { Observable, of, from, firstValueFrom } from 'rxjs';
import { FIRESTORE, fromRef, toDate } from 'ngfire/firestore';
import { keepUnstableUntilFirst, shareWithDelay } from 'ngfire/core';
import { shareReplay, filter, map, switchMap } from 'rxjs/operators';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, AUTH_DEPS } from 'ngfire/tokens';

function user(auth) {
    return new Observable(subscriber => {
        const unsubscribe = onIdTokenChanged(auth, subscriber.next.bind(subscriber), subscriber.error.bind(subscriber), subscriber.complete.bind(subscriber));
        return { unsubscribe };
    });
}

const FIRE_AUTH = new InjectionToken('Fire auth instance', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const app = inject(FIREBASE_APP);
        const deps = inject(AUTH_DEPS, { optional: true }) || undefined;
        if (config.auth) {
            return config.auth(app, deps);
        }
        else {
            return deps ? initializeAuth(app, deps) : getAuth(app);
        }
    },
});

const exist = (v) => v !== null && v !== undefined;
/**
 * Get the custom claims of a user. If no key is provided, return the whole claims object
 * @param user The user object returned by Firebase Auth
 * @param roles Keys of the custom claims inside the claim objet
 */
async function getCustomClaims(user, keys) {
    if (!user)
        return {};
    const { claims } = await user.getIdTokenResult();
    if (!keys)
        return claims;
    const fields = Array.isArray(keys) ? keys : [keys];
    const result = {};
    for (const key of fields) {
        if (claims[key]) {
            result[key] = claims[key];
        }
    }
    return result;
}
function isUpdateCallback(update) {
    return typeof update === 'function';
}
class BaseFireAuth {
    memoProfile = {};
    platformId = inject(PLATFORM_ID);
    getAuth = inject(FIRE_AUTH);
    injector = inject(Injector);
    zone = inject(NgZone);
    idKey = 'id';
    verificationUrl;
    get db() {
        return this.injector.get(FIRESTORE);
    }
    get auth() {
        return this.injector.get(FIRE_AUTH);
    }
    get user() {
        return this.auth.currentUser;
    }
    user$ = isPlatformServer(this.platformId)
        ? this.zone.runOutsideAngular(() => user(this.auth))
        : user(this.auth).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    /**
     * Observe current user. Doesn't emit if there are no user connected.
     * Use `user` if you need to know if user is connected
     */
    currentUser$ = this.user$.pipe(filter(exist));
    /** Listen on changes from the authenticated user */
    profile$ = this.user$.pipe(map((user) => this.getRef({ user })), switchMap((ref) => (ref ? this.useMemo(ref) : of(undefined))), map(snapshot => snapshot ? this.fromFirestore(snapshot) : undefined));
    useMemo(ref) {
        if (isPlatformServer(this.platformId)) {
            return this.zone.runOutsideAngular(() => from(getDoc(ref))).pipe(keepUnstableUntilFirst(this.zone));
        }
        if (!this.memoProfile[ref.path]) {
            this.memoProfile[ref.path] = fromRef(ref).pipe(shareWithDelay(100));
        }
        return this.memoProfile[ref.path];
    }
    /**
     * Select the roles for this user. Can be in custom claims or in a Firestore collection
     * @param user The user given by FireAuth
     * @see getCustomClaims to get the custom claims out of the user
     * @note Can be overwritten
     */
    selectRoles(user) {
        return getCustomClaims(user);
    }
    /**
     * Function triggered when getting data from firestore
     * @note should be overwritten
     */
    fromFirestore(snapshot) {
        return snapshot.exists()
            ? { ...toDate(snapshot.data()), [this.idKey]: snapshot.id }
            : undefined;
    }
    /**
     * Function triggered when adding/updating data to firestore
     * @note should be overwritten
     */
    toFirestore(profile, actionType) {
        if (actionType === 'add') {
            const _meta = { createdAt: new Date(), modifiedAt: new Date() };
            return { _meta, ...profile };
        }
        else {
            return { ...profile, '_meta.modifiedAt': new Date() };
        }
    }
    /**
     * Function triggered when transforming a user into a profile
     * @param user The user object from FireAuth
     * @param ctx The context given on signup
     */
    createProfile(user, ctx) {
        return { avatar: user?.photoURL, displayName: user?.displayName };
    }
    /** Triggerd when creating or getting a user */
    useCollection(user) {
        return this.path ?? null;
    }
    /** If user connected, return its document in Firestore,  */
    getRef(options = {}) {
        const user = options.user ?? this.user;
        if (user) {
            return doc(this.db, `${this.path}/${user.uid}`);
        }
        return;
    }
    /** Return current user. Only return when auth has emit */
    awaitUser() {
        return firstValueFrom(this.user$);
    }
    /** Get the current user Profile from Firestore */
    async getValue() {
        const ref = this.getRef();
        if (ref) {
            const snapshot = await getDoc(ref);
            return this.fromFirestore(snapshot);
        }
        return;
    }
    /**
     * @description Delete user from authentication service and database
     * WARNING This is security sensitive operation
     */
    async delete(options = {}) {
        const user = this.user;
        const ref = this.getRef({ user });
        if (!user || !ref) {
            throw new Error('No user connected');
        }
        const { write = writeBatch(this.db), ctx } = options;
        write.delete(ref);
        if (this.onDelete)
            await this.onDelete({ write, ctx });
        if (!options.write) {
            await write.commit();
        }
        return user.delete();
    }
    /** Update the current profile of the authenticated user */
    async update(profile, options = {}) {
        const ref = this.getRef();
        if (!ref) {
            throw new Error('No user connected.');
        }
        if (isUpdateCallback(profile)) {
            return runTransaction(this.db, async (tx) => {
                const snapshot = (await tx.get(ref));
                const doc = this.fromFirestore(snapshot);
                if (!doc) {
                    throw new Error(`Could not find document at "${this.path}/${snapshot.id}"`);
                }
                const data = await profile(this.toFirestore(doc, 'update'), tx);
                tx.update(ref, data);
                if (this.onUpdate)
                    await this.onUpdate(data, { write: tx, ctx: options.ctx });
                return tx;
            });
        }
        else if (typeof profile === 'object') {
            const { write = writeBatch(this.db), ctx } = options;
            write.update(ref, this.toFirestore(profile, 'update'));
            if (this.onUpdate)
                await this.onUpdate(profile, { write, ctx });
            // If there is no atomic write provided
            if (!options.write) {
                return write.commit();
            }
        }
    }
    /** Manage the creation of the user into Firestore */
    async create(cred, options) {
        const user = cred.user;
        if (!user) {
            throw new Error('Could not create an account');
        }
        const { write = writeBatch(this.db), ctx, collection } = options;
        if (this.onSignup)
            await this.onSignup(cred, { write, ctx, collection });
        const ref = this.getRef({ user, collection });
        if (ref) {
            const profile = await this.createProfile(user, ctx);
            write.set(ref, this.toFirestore(profile, 'add'));
            if (this.onCreate)
                await this.onCreate(profile, { write, ctx, collection });
            if (!options.write) {
                await write.commit();
            }
        }
        return cred;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: BaseFireAuth, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: BaseFireAuth, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: BaseFireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
class FireAuth extends BaseFireAuth {
    /**
     * Create a user based on email and password
     * Will send a verification email to the user if verificationURL is provided config
     */
    async signup(email, password, options = {}) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        if (this.verificationUrl) {
            const url = this.verificationUrl;
            await sendEmailVerification(cred.user, { url });
        }
        return this.create(cred, options);
    }
    async signin(provider, passwordOrOptions, options) {
        try {
            let cred;
            if (!provider) {
                cred = await signInAnonymously(this.auth);
            }
            else if (passwordOrOptions &&
                typeof provider === 'string' &&
                typeof passwordOrOptions === 'string') {
                cred = await signInWithEmailAndPassword(this.auth, provider, passwordOrOptions);
            }
            else if (typeof provider === 'object') {
                cred = await signInWithPopup(this.auth, provider);
            }
            else {
                cred = await signInWithCustomToken(this.auth, provider);
            }
            if (!cred.user) {
                throw new Error('Could not find credential for signin');
            }
            // Signup: doesn't trigger onSignin
            if (getAdditionalUserInfo(cred)?.isNewUser) {
                options = typeof passwordOrOptions === 'object' ? passwordOrOptions : {};
                return this.create(cred, options);
            }
            if (this.onSignin)
                await this.onSignin(cred);
            return cred;
        }
        catch (err) {
            if (err.code === 'auth/operation-not-allowed') {
                console.warn('You tried to connect with a disabled auth provider. Enable it in Firebase console');
            }
            throw err;
        }
    }
    /** Signs out the current user and clear the store */
    async signout() {
        await signOut(this.auth);
        if (this.onSignout)
            await this.onSignout();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireAuth, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireAuth, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { BaseFireAuth, FIRE_AUTH, FireAuth, getCustomClaims, isUpdateCallback };
//# sourceMappingURL=ngfire-auth.mjs.map
