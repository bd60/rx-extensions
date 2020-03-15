import { BehaviorSubject, Observable } from 'rxjs';
export declare type StateModifier<D, T> = (state: T, value: D) => T | Observable<T>;
export interface Modifier<D, T> {
    payload: D;
    modifier: StateModifier<D, T>;
}
export declare class StateStore<T> extends BehaviorSubject<T> {
    private actionSource;
    constructor(init: T);
    modify<D>(payload: D, modifier: StateModifier<D, T>): void;
    select<K>(...keys: string[]): Observable<K>;
    next(value: T): void;
}
