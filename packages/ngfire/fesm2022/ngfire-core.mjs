import { timer, of, ReplaySubject, Observable, from, combineLatest, queueScheduler, asyncScheduler } from 'rxjs';
import { share, tap, startWith, map, switchMap, debounceTime, subscribeOn, observeOn } from 'rxjs/operators';

function shareWithDelay(delay = 100) {
    return share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: () => delay ? timer(delay) : of(true),
        resetOnError: true,
        resetOnComplete: false,
    });
}
/**
 * Operator that join the source with sub queries.
 * There are two stategies :
 * 1. `shouldAwait: true`: Await all subqueries to emit once before emitting a next value
 * 2. `shouldAwait: false`: Emit the source and hydrate it with the subqueries along the way
 * @example
 * ```typescript
 * of({ docUrl: '...' }).valueChanges().pipe(
 *   joinWith({
 *     doc: source => fetch(docUrl).then(res => res.json()),
 *   }, { shouldAwait: true })
 * ).subscribe(res => console.log(res.subQuery))
 * ```
 * @param queries A map of subqueries to apply. Each query can return a static value, Promise or Observable
 * @param options Strategy to apply on the joinWith
 */
function joinWith(queries, options = {}) {
    const shouldAwait = options.shouldAwait ?? true;
    const debounce = options.debounceTime ?? 100;
    const runQuery = (entity) => {
        const obs = [];
        for (const key in queries) {
            // Transform return value into an observable
            let result = queries[key](entity);
            if (!(result instanceof Observable)) {
                if (result instanceof Promise) {
                    result = from(result);
                }
                else {
                    result = of(result);
                }
            }
            // Hydrate the entity with the data
            let observe;
            if (shouldAwait) {
                observe = result.pipe(tap(result => entity[key] = result));
            }
            else {
                observe = result.pipe(startWith(undefined), tap(result => entity[key] = result));
            }
            obs.push(observe);
        }
        if (!obs.length)
            return of(entity);
        return combineLatest(obs).pipe(map(() => {
            if (!entity)
                return entity;
            return JSON.parse(JSON.stringify(entity), jsonDateReviver);
        }));
    };
    return switchMap((data) => {
        if (Array.isArray(data)) {
            if (!data.length)
                return of([]);
            return combineLatest(data.map(runQuery)).pipe(debounceTime(debounce));
        }
        return runQuery(data);
    });
}
function jsonDateReviver(_, value) {
    if (!value)
        return value;
    const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,}|)Z$/;
    if (typeof value === 'string' && dateFormat.test(value))
        return new Date(value);
    if (typeof value === 'object' &&
        Object.keys(value).length === 2 &&
        ['nanoseconds', 'seconds'].every((k) => k in value))
        return new Date(((value.nanoseconds * 1) ^ -6) + value.seconds * 1000);
    return value;
}

function exist(doc) {
    return doc !== undefined && doc !== null;
}
function isNotUndefined(doc) {
    return doc !== undefined;
}
//////////
// PATH //
//////////
function isDocPath(path) {
    return path.split('/').length % 2 === 0;
}
// Check if a string is a full path
function isPathRef(path) {
    return !!((typeof path === "string") && (path.split('/').length > 1) && !path.includes(':'));
}
function isIdList(idsOrQuery) {
    return idsOrQuery.every(id => typeof id === 'string');
}
/** Get the params from a path */
function getPathParams(path) {
    return path
        .split('/')
        .filter((segment) => segment.charAt(0) === ':')
        .map((segment) => segment.substring(1));
}
function assertPath(path) {
    for (const segment of path.split('/')) {
        if (segment.charAt(0) === ':') {
            const key = segment.substring(1);
            throw new Error(`Required parameter ${key} from ${path} has not been provided`);
        }
    }
}
function assertCollection(path) {
    if (isDocPath(path)) {
        throw new Error(`Expected collection path but got: ${path}`);
    }
}
/**
 * Transform a path based on the params
 * @param path The path with params starting with "/:"
 * @param params A map of id params
 * @example pathWithParams('movies/:movieId/stakeholder/:shId', { movieId, shId })
 */
function pathWithParams(path, params) {
    if (!params)
        return path;
    if (!path.includes(':'))
        return path;
    return path
        .split('/')
        .map((segment) => {
        if (segment.charAt(0) === ':') {
            const key = segment.substr(1);
            return params[key] || segment;
        }
        else {
            return segment;
        }
    })
        .join('/');
}
////////////////
// REFERENCES //
////////////////
function isQuery(ref) {
    return ref.type === 'query';
}
function isCollectionRef(ref) {
    return ref.type === 'collection';
}

class ɵZoneScheduler {
    zone;
    delegate;
    constructor(zone, delegate = queueScheduler) {
        this.zone = zone;
        this.delegate = delegate;
    }
    now() {
        return this.delegate.now();
    }
    schedule(work, delay, state) {
        const targetZone = this.zone;
        // Wrap the specified work function to make sure that if nested scheduling takes place the
        // work is executed in the correct zone
        const workInZone = function (state) {
            targetZone.runGuarded(() => {
                work.apply(this, [state]);
            });
        };
        // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
        // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
        // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
        return this.delegate.schedule(workInZone, delay, state);
    }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
class BlockUntilFirstOperator {
    zone;
    task = null;
    constructor(zone) {
        this.zone = zone;
    }
    call(subscriber, source) {
        const unscheduleTask = this.unscheduleTask.bind(this);
        this.task = this.zone.run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
        return source.pipe(tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
    }
    unscheduleTask() {
        // maybe this is a race condition, invoke in a timeout
        // hold for 10ms while I try to figure out what is going on
        setTimeout(() => {
            if (this.task != null && this.task.state === 'scheduled') {
                this.task.invoke();
                this.task = null;
            }
        }, 10);
    }
}
function keepUnstableUntilFirst(ngZone) {
    return (obs$) => {
        obs$ = obs$.lift(new BlockUntilFirstOperator(ngZone));
        return obs$.pipe(
        // Run the subscribe body outside of Angular (e.g. calling Firebase SDK to add a listener to a change event)
        subscribeOn(ngZone.runOutsideAngular(() => new ɵZoneScheduler(Zone.current))), 
        // Run operators inside the angular zone (e.g. side effects via tap())
        observeOn(ngZone.run(() => new ɵZoneScheduler(Zone.current, asyncScheduler))));
    };
}

/**
 * Generated bundle index. Do not edit.
 */

export { assertCollection, assertPath, exist, getPathParams, isCollectionRef, isDocPath, isIdList, isNotUndefined, isPathRef, isQuery, joinWith, keepUnstableUntilFirst, pathWithParams, shareWithDelay, ɵZoneScheduler };
//# sourceMappingURL=ngfire-core.mjs.map
