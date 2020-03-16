import { StateStore } from './state-store';
import { Observable } from 'rxjs';
export declare type ArrayData<T> = Array<T>;
declare type ArrayInput<T> = Array<T> | Observable<Array<T>>;
declare type ItemInput<T> = T | Observable<T>;
declare type ArrayPredicate<T> = (item: T) => boolean;
export declare class ArrayStore<T> extends StateStore<ArrayData<T>> {
    constructor();
    concat(items: ArrayInput<T>): void;
    push(item: ItemInput<T>): void;
    unshift(item: ItemInput<T>): void;
    replace(): void;
    replaceAtIndex(index: number): void;
    insertAtIndex(index: number): void;
    removeAtIndex(index: number): void;
    remove(): void;
    removeWhere(): void;
    updateWhere(): void;
    getIndex(index: number): Observable<T>;
    find(predicate: ArrayPredicate<T>): Observable<T>;
    filter(predicate: ArrayPredicate<T>): Observable<T[]>;
    sort(compareFn?: (a: T, b: T) => number): Observable<ArrayData<T>>;
}
export {};
