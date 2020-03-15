import { Observable, isObservable } from 'rxjs';

import { StateStore, Modifier } from './state-store';
import { map } from 'rxjs/operators';


export interface KeyedData<T> {
    [key:string]: T
}

interface UpdatePayload<T> {
    key: string;
    data: T | Observable<T>;
}


export class DataStore<T> extends StateStore<KeyedData<T>> {

    private keyedDataModifier<T>(state: KeyedData<T>, payload: UpdatePayload<T>) {
        const mod = (v: T) => ({...state, ...{[payload.key]: v}});
        return (isObservable(payload.data)) 
            ? payload.data.pipe(map(v => mod(v))) 
            : mod(payload.data);
    }
    
    constructor() {
        super({});
    }

    get(key: string) {
        return this.select(key);
    }

    set(key: string, data: T | Observable<T>) {
        this.modify({key, data}, this.keyedDataModifier);
    }

    delete(key: string) {
        this.set(key, undefined)
    }

    update<D>(key: string, modifier: Modifier<D, T>) {
        const stateModifier = (state: KeyedData<T>, payload: Modifier<D,T>) => {
            const item = state[key];
            if (!item) {
                throw new Error('cannot call update on non existent key');
            }
            const modItem = payload.modifier(item, payload.payload);
            return this.keyedDataModifier(state, {key, data: modItem});
        }
        this.modify(modifier, stateModifier);
    }

    clear() {
        this.next({});
    }
}