import { forkJoin, concat, Observable } from 'rxjs'
import { reduce } from 'rxjs/operators';

export function batchJoin<T>(obs: Observable<T>[], batchSize = 5) {
    const batches: Array<Array<Observable<T>>> = [];
    for (let i = 0; i < obs.length; i+= batchSize) {
        batches.push(obs.slice(i, i + batchSize));
    }
    return concat(...batches).pipe(
        reduce((acc, v) => acc.concat(v), [])
    );
}