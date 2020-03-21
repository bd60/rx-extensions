import { Observable, of, EMPTY } from 'rxjs';

import { DataStore, KeyedData } from './data-store';
import { switchMap } from 'rxjs/operators';

function isFunction(obj: any): obj is Function {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

export type ResourceFunction<T, D> = (arg: D) => Observable<T>

export type KeyBuilder<D> = (arg: D) => string

export interface ResourceStoreConfig<T, D> {
    initialState?: T;
    getResource: ResourceFunction<T, D>;
    keyBuilder?: KeyBuilder<D>;
}

const defaultKeyBuilder = <D>(arg: D) => typeof arg === 'string' ? arg : (isFunction(arg.toString)) ? arg.toString() : JSON.stringify(arg);

export abstract class AbstractResourceStore<T, D> extends DataStore<T> {
    abstract getResource(arg: D): Observable<T>
    keyBuilder(arg: D): string {
        return defaultKeyBuilder(arg);
    };

    constructor(initialState: KeyedData<T> = {}) {
        super(initialState);
    }

    cacheGet(arg: D) {
        const key = this.keyBuilder(arg)
        return this.get(key).pipe(
            switchMap(value => {
                if (!value) {
                    this.set(key, this.getResource(arg));
                    return EMPTY;
                }
                return of(value);
            })
        );
    }

    cacheSet(arg: D) {
        const key = this.keyBuilder(arg);
        this.set(key, this.getResource(arg));
    }
}

export class ResourceStore<T, D> extends AbstractResourceStore<T, D> {
    getResource: ResourceFunction<T, D>;
    keyBuilder: KeyBuilder<D>;
    constructor(config: ResourceStoreConfig<T,D>) {
        super(config.initialState || {});
        this.getResource = config.getResource;
        this.keyBuilder = config.keyBuilder || defaultKeyBuilder;
    }
}