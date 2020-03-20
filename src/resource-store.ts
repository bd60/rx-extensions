import { Observable, isObservable, combineLatest, of, EMPTY } from 'rxjs';

import { StateModifier, Modifier } from './state-store';
import { DataStore, KeyedData } from './data-store';
import { map, switchMap, mapTo } from 'rxjs/operators';

export type ResourceFunction<T, D> = (arg: D) => Observable<T>

export type KeyBuilder<D> = (arg: D) => string

export interface ResourceStoreConfig<T, D> {
    initialState?: T;
    getResource: ResourceFunction<T, D>;
    keyBuilder?: KeyBuilder<D>;
}

const defaultKeyBuilder = <D>(arg: D) => typeof arg === 'string' ? arg : JSON.stringify(arg);

export abstract class AbstractResourceStore<T, D> extends DataStore<T> {
    getResource: ResourceFunction<T, D>
    keyBuilder: KeyBuilder<D>;

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
    constructor(config: ResourceStoreConfig<T,D>) {
        super(config.initialState || {});
        this.getResource = config.getResource;
        this.keyBuilder = config.keyBuilder || defaultKeyBuilder;
    }
}