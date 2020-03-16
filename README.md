# Rx Extensions

*A set of useful extensions and operators for RxJS*

## State Store

*Specialized subject for storing and modifying application state.  Inspired by the NgRx Store.*

### Usage

```javascript
// instantiate with initial state
const stateStore = new StateStore<MyState>(INITIAL_STATE);

// call modify to update the state
// modify takes 2 arguments, some data to feed into the modifier, and the modifier itself which is a function that updates the state

const modifier = (state: MyState, data: MyModifierData): MyState => {
    // use non mutative methods to update state
    return {...state, ...{data}};
}

stateStore.modify(myData, modifier);

// modifiers can also return observables of data
const modifier$ = (state: MyState, data$: Observable<MyModifierData>): Observable<MyState> => {
    return data$.pipe(
        map(data => ({...state, ...{data}}))
    );
}

stateStore.modify(myData$, modifier$);
```

## Data Store

*specialized extension of StateStore for data that meets the interface `{[key: string]: T}`*

## Array Store

*specialized extension of StateStore for data that meets the interface `Array<T>`*

## Operators

### batchJoin

*`forkJoin` wrapper that executes streams in batches of a specified size, default 5*
