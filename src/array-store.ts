import { Observable, isObservable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { StateStore } from './state-store'

export type ArrayData<T> = Array<T>;

type ArrayInput<T> = Array<T> | Observable<Array<T>>;
type ItemInput<T> = T | Observable<T>;

type ArrayPredicate<T> = (item: T) => boolean

export class ArrayStore<T> extends StateStore<ArrayData<T>> {

    private arrayInsertAt(state: ArrayData<T>, data: ArrayData<T>, index?: number) {
        index = index !== undefined ? index : state.length;
        const head = state.slice(0, index);
        const tail = state.slice(index);
        return [...head, ...data, ...tail];
    }

    private insertModifier(state: ArrayData<T>, payload: {index?: number, data: ArrayInput<T>}) {
        return isObservable(payload.data)
            ? payload.data.pipe(
                map(d => this.arrayInsertAt(state, d, payload.index))
            )
            : this.arrayInsertAt(state, payload.data, payload.index);
    }

    private arrayRemoveAt(state: ArrayData<T>, index?: number) {
        index = index !== undefined ? index : state.length - 1;
        const head = state.slice(0, index);
        const tail = state.slice(index + 1);
        return [...head, ...tail];
    }

    private removeModifier(state: ArrayData<T>, index?: number) {
        return this.arrayRemoveAt(state, index)
    }
    constructor(initialState: ArrayData<T> = []) {
        super(initialState);
    }

    insertAtIndex(data: ArrayInput<T>, index?: number) {
        this.modify({index, data}, this.insertModifier);
    }

    concat(items: ArrayInput<T>) {
        this.insertAtIndex(items)
    }

    push(item: ItemInput<T>) {
        if (isObservable(item)) {
            this.concat(item.pipe(map(i => [i])))
        } else {
            this.concat([item])
        }
    }

    unshift(item: ItemInput<T>) {
        if (isObservable(item)) {
            this.insertAtIndex(item.pipe(map(i => [i])), 0)
        } else {
            this.insertAtIndex([item], 0)
        }
    }

    removeAtIndex(index?: number) {
        this.modify(index, this.removeModifier)
    }

    // removes section?
    slice() {

    }

    shift() {
        this.removeAtIndex(0)
    }

    pop() {
        this.removeAtIndex()
    }

    empty() {
        this.next([])
    }

    // replace() {

    // }

    // replaceWhere() {

    // }

    // replaceAtIndex(index: number) {

    // }

    // remove() {

    // }

    // removeWhere() {

    // }

    // updateWhere() {

    // }

    getIndex(index?: number) {
        return this.pipe(
            map(arr => arr[index || arr.length - 1]),
            distinctUntilChanged()
        );
    }

    getFirst() {
        return this.getIndex(0);
    }

    getLast() {
        return this.getIndex();
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