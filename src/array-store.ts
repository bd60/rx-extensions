
import { StateStore } from './state-store'
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type ArrayData<T> = Array<T>;

type ArrayInput<T> = Array<T> | Observable<Array<T>>;
type ItemInput<T> = T | Observable<T>;

type ArrayPredicate<T> = (item: T) => boolean

export class ArrayStore<T> extends StateStore<ArrayData<T>> {
    constructor() {
        super([]);
    }

    concat(items: ArrayInput<T>) {

    }

    push(item: ItemInput<T>) {

    }

    unshift(item: ItemInput<T>) {

    }

    replace() {

    }

    replaceAtIndex(index: number) {

    }

    insertAtIndex(index: number) {

    }

    removeAtIndex(index: number) {

    }

    remove() {

    }

    removeWhere() {

    }

    updateWhere() {

    }

    getIndex(index: number) {
        return this.pipe(
            map(arr => arr[index]),
            distinctUntilChanged()
        );
    }

    find(predicate: ArrayPredicate<T>) {
        return this.pipe(
            map(array => array.find(predicate)),
            distinctUntilChanged()
        )
    }

    filter(predicate: ArrayPredicate<T>) {
        return this.pipe(
            map(array => array.filter(predicate))
        );
    }

    sort(compareFn?: (a: T, b:T) => number) {
        return this.pipe(
            map(array => array.sort(compareFn))
        )
    }
}