import { forkJoin, concat, Observable, of, pipe, OperatorFunction, combineLatest, merge } from 'rxjs'
import { reduce, pluck, distinctUntilChanged, map } from 'rxjs/operators';

export function concatJoin<T>(...obs: Observable<T>[]): Observable<T[]> {
    return concat(...obs).pipe(
        reduce((acc: T[], v) => acc.concat([v]), [])
    );
}

export function batchJoin<T>(obs: Observable<T>[], batchSize = 5): Observable<T[]> {
    if (!obs.length) {
        return of([]);
    }
    const batches: Array<Observable<Array<T>>> = [];
    for (let i = 0; i < obs.length; i += batchSize) {
        batches.push(forkJoin(obs.slice(i, i + batchSize)));
    }
    return concatJoin(...batches).pipe(
        map(arrays => arrays.reduce((acc, v) => acc.concat(v), []))
    );
}

export function pluckDistinct<T, K>(...keys: string[]) {
    return pipe(
        pluck<T, K>(...keys),
        distinctUntilChanged()
    );
}

export function pluckManyLatest<T, R>(keys: Array<string | string[]>): OperatorFunction<T, R[]> {
    return obs => {
        const items$ = keys.map(k => Array.isArray(k) ? obs.pipe(pluckDistinct<T, R>(...k)) : obs.pipe(pluckDistinct<T, R>(k)));
        return combineLatest(items$);
    }
}

export function pluckManyMerge<T, R>(keys: Array<string | string[]>): OperatorFunction<T, [string | string[], R]> {
    return obs => {
        const items$ = keys.map(k => 
            (Array.isArray(k) ? obs.pipe(pluckDistinct<T, R>(...k)) : obs.pipe(pluckDistinct<T, R>(k))).pipe(
                map<R, [string|string[], R]>(item => [k, item])
            )
        );
        return merge(...items$);
    }
}