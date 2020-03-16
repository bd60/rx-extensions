import { BehaviorSubject, Subject, Observable, isObservable, of } from 'rxjs';
import { mergeScan, pluck, distinctUntilChanged } from 'rxjs/operators';

export type StateModifier<D, T> = (state:T, value:D) => T | Observable<T>;

export interface Modifier<D, T> {
  payload: D,
  modifier: StateModifier<D, T>
}

export class StateStore<T> extends BehaviorSubject<T> {

  private actionSource = new Subject<Modifier<any, T>>();

  constructor(init: T) {
    super(init);
    this.actionSource.pipe(
      mergeScan((acc, val) => {
        const newState = val.modifier(acc, val.payload);
        return (isObservable(newState)) ? newState : of(newState)
      } ,init)
    ).subscribe(
      (v) => super.next(v),
      (e) => this.error(e),
      () => this.complete()
    );
  }

  modify<D>(payload: D, modifier: StateModifier<D, T>) {
    this.actionSource.next({payload, modifier});
  }
  
  select<K>(...keys: string[]) {
    return this.pipe(
      pluck<T, K>(...keys),
      distinctUntilChanged()
    );
  }

  next(value: T) {
    const modifier = (acc:T, value:T) => value;
    this.modify(value, modifier);
  }

  reset(state: T) {
      this.next(state)
  }
}
