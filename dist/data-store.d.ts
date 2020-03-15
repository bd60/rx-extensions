import { Observable } from 'rxjs';
import { StateStore, Modifier } from './state-store';
export interface KeyedData<T> {
    [key: string]: T;
}
export declare class DataStore<T> extends StateStore<KeyedData<T>> {
    private keyedDataModifier;
    private dataModifier;
    constructor();
    get(key: string): Observable<T>;
    getMany(keys: string[]): Observable<T[]>;
    set(key: string, data: T | Observable<T>): void;
    setMany(data: KeyedData<T> | Observable<KeyedData<T>>): void;
    delete(key: string): void;
    deleteMany(keys: string[]): void;
    update<D>(key: string, modifier: Modifier<D, T>): void;
    updateMany<D>(modifier: Modifier<D, KeyedData<T>>): void;
    clearAll(): void;
}
