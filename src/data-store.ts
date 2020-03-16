import { Observable, isObservable, combineLatest } from 'rxjs';

import { StateStore, StateModifier, Modifier } from './state-store';
import { map } from 'rxjs/operators';


export interface KeyedData<T> {
    [key:string]: T
}

type KeyedDataInput<T> = KeyedData<T> | Observable<KeyedData<T>>;
type DataInput<T> = T | Observable<T>;

interface ItemUpdatePayload<T> {
    key: string;
    data: DataInput<T>;
}

interface DataUpdatePayload<T> {
    data: KeyedDataInput<T>;
}

export class DataStore<T> extends StateStore<KeyedData<T>> {

    private keyedDataModifier(state: KeyedData<T>, payload: ItemUpdatePayload<T>) {
        const mod = (v: T) => ({...state, ...{[payload.key]: v}});
        return (isObservable(payload.data)) 
            ? payload.data.pipe(map(v => mod(v))) 
            : mod(payload.data);
    }

    private dataModifier(state: KeyedData<T>, payload: DataUpdatePayload<T>) {
        const mod = (v: KeyedData<T>) => ({...state, ...v});
        return (isObservable(payload.data)) 
            ? payload.data.pipe(map(v => mod(v))) 
            : mod(payload.data);
    }
    
    constructor(initialState: KeyedData<T> = {}) {
        super(initialState);
    }

    get(key: string) {
        return this.select<T>(key);
    }

    getMany(keys: string[]) {
        return combineLatest(
            keys.map(key => this.get(key))
        )
    }

    set(key: string, data: DataInput<T>) {
        this.modify({key, data}, this.keyedDataModifier);
    }

    setMany(data: KeyedDataInput<T>) {
        this.modify({data}, this.dataModifier)
    }

    delete(key: string) {
        this.set(key, undefined)
    }

    deleteMany(keys: string[]) {
        this.setMany(keys.reduce((data, key) => ({...data, ...{[key]: undefined}}), {}))
    }

    update<D>(key: string, payload: D, modifier: StateModifier<D, T>) {
        const stateModifier = (state: KeyedData<T>, payload: Modifier<D,T>) => {
            const item = state[key];
            if (!item) {
                throw new Error('cannot call update on non existent key');
            }
            const data = payload.modifier(item, payload.payload);
            return this.keyedDataModifier(state, {key, data});
        }
        this.modify({payload, modifier}, stateModifier);
    }

    updateMany<D>(payload: D, modifier: StateModifier<D, KeyedData<T>>) {
        const stateModifier = (state: KeyedData<T>, payload: Modifier<D, KeyedData<T>>) => {
            const data = payload.modifier(state, payload.payload);
            return this.dataModifier(state, {data});
        }
        this.modify({payload, modifier}, stateModifier);
    }

    clearAll() {
        this.next({});
    }
}