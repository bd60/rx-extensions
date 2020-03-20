import { Observable, isObservable, combineLatest, of, EMPTY } from 'rxjs';

import { StateModifier, Modifier } from './state-store';
import { DataStore, KeyedData } from './data-store';
import { map, switchMap, mapTo } from 'rxjs/operators';

export type ResourceFunction<T, D> = (arg: D) => Observable<T>

export type KeyBuilder<D> = (arg: D) => string

export interface ResourceStoreConfig<T, D> {
    initialState?: T;
    getResource: ResourceFunction<T, D>;
    updateResource?: ResourceFunction<T, D>;
    deleteResource?: ResourceFunction<T, D>;
    createResource?: ResourceFunction<T, D>;
    keyBuilder?: KeyBuilder<D>;
}

const defaultKeyBuilder = <D>(arg: D) => typeof arg === 'string' ? arg : JSON.stringify(arg);

export abstract class AbstractResourceStore<T, D> extends DataStore<T> {
    getResource: ResourceFunction<T, D>
    updateResource?: ResourceFunction<T, D>
    deleteResource?: ResourceFunction<T, D>
    createResource?: ResourceFunction<T, D>
    keyBuilder: KeyBuilder<D>;

    constructor(initialState: KeyedData<T> = {}) {
        super(initialState);
    // constructor(config: ResourceStoreConfig<T,A>) {
        // super(config.initialState || {});
        // this.getResource = config.getResource;
        // this.updateResource = config.updateResource;
        // this.deleteResource = config.deleteResource;
        // this.createResource = config.createResource;
        // this.keyBuilder = config.keyBuilder || defaultKeyBuilder;
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

    cacheDelete(arg: D) {
        if (!this.deleteResource) {
            throw new Error('cacheDelete requires a delete resource function')
        }
        const key = this.keyBuilder(arg);
        this.set(key, this.deleteResource(arg).pipe(mapTo(undefined)))
    }

    cacheUpdate(arg: D) {
        if (!this.updateResource) {
            throw new Error('cacheUpdate requires an update resource function')
        }
        const key = this.keyBuilder(arg);
        const modifier: StateModifier<D, T> = (state: T, payload: D) => {
            return this.updateResource(arg);
        }
        this.update(key, arg, modifier);
    }

    cacheCreate(arg: D) {
        if (!this.createResource) {
            throw new Error('cacheCreate requires a create resource function')
        }
        const key = this.keyBuilder(arg);
        this.set(key, this.createResource(arg))
    }

}