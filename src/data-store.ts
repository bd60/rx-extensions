
import { StateStore } from './state-store'

export interface KeyedData<T> {
    [key:string]: T
}

export class DataStore<T> extends StateStore<KeyedData<T>> {
    constructor() {
        super({})
    }
}