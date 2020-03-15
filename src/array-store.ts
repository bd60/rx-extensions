
import { StateStore } from './state-store'

export type ArrayData<T> = Array<T>;

export class ArrayStore<T> extends StateStore<ArrayData<T>> {
    constructor() {
        super([])
    }
}