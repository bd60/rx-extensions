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

// get data with select, feed as many key arguments as needed for nested keys
stateStore.select('data').subscribe(data => console.log('got data:' data));

// calling next will reset the data modifier to whatever is fed as an argument
// semantic reset method is available as a wrapper
stateStore.reset(myNewState)
```

## Data Store

*Specialized extension of StateStore for data that meets the interface `{[key: string]: T}`*

### Usage

```javascript
// initial state is optional, defaults to {}
const dataStore = new DataStore<MyData>()

// set data key with set, can also take observable of the data (this is true for all set and update operations)
dataStore.set('dataKey', myData)

// get data key with get
dataStore.get('dataKey').subscribe(data => console.log('got data:' data));

// update data key with update, takes modifier of the data at the key and data to update (can return observable)
// use set to totally replace, use update when you need the data in the store to make the update
const myUpdateModifier = (state: MyData, data: MyUpdateData) =>{
    return {...state, ...{data}};
}
dataStore.update('dataKey', myUpdateData, myUpdateModifier);

// delete keys with delete
dataStore.delete('dataKey');

// the above all also have `Many` variations:
dataStore.setMany({dataKey1: myData1, dataKey2: myData2})

dataStore.getMany(['dataKey1', 'dataKey2']).subscribe(([myData1, myData2]) => console.log(myData1, myData2));

// updateMany takes an argument of an object with keys to update and the data to use in the update, and the modifier to run on each key
const myUpdateManyModifier = (state: MyData, data: MyUpdateData) =>{
    return {...state, ...data};
}
dataStore.updateMany({dataKey1: myUpdateData1, dataKey2: myUpdateData2}, myUpdateManyModifier);

dataStore.deleteMany(['dataKey1', 'dataKey2']);

// reset data, takes optional argument of data state, will be {} by default
dataStore.reset()
```

## Resource Store

*Specialized extension of DataStore that deals with a remote resource*

### Usage

```javascript
// two ways to use

// 1. via construction that takes a config with (optional) inistial state and a function to fetch the remote resource

function getResource(url: string): Observable<MyType> {
    return http.get(url);
}

const resourceStore = new ResourceStore<MyType, string>({getResource});

// 2. or you may extend the AbstractResourceStore and provide a getResource function

class MyResourceStore extends AbstractResourceStore<MyType, string> {
    getResource(url: string) {
        return http.get(url);
    }
}

// both methods may define a key builder function as well in the case of more complex input:

type MyInput = { id: string };
function keyBuilder(input: MyInput) {
    return input.id
}

const resourceStore = new ResourceStore<MyType, string>({getResource, keyBuilder});

class MyResourceStore extends AbstractResourceStore<MyType, string> {
    getResource(input: MyInput) {
        return http.get('https://my.api.com/' + input.id);
    }

     keyBuilder(input: MyInput) {
        return input.id
    }
}

// the resource store provides a cacheGet method that will check the cache, if it's not there, it will call the getResource method and set it

resourceStore.cacheGet(url).subsribe(v => console.log(v, "this resource was fetched from cache or remote!"))

// it also provides a cacheSet method that gets the remote resource and populates the cache with the response

resourceStore.cacheSet(url)
```

## Array Store

*Specialized extension of StateStore for data that meets the interface `Array<T>`*

### Work In Progress... Documentation coming

## Pull Subject

*Implements observer pattern to pull responses from observers and gather responses*

### Usage

```javascript
// using this interface
interface MyType {
    key: string;
    key2: number;
}

// declare like a normal subject, optionally declare with a collector reducer
// default collector reducer merges partials like {...collected, ...collector}
const pullSubject = new PullSubject<MyType>();

// use pull method to register a collector, which needs to return a partial type
pullSubject.pull(() => {
    return {key: 'value'};
});

// register async collectors with pullASync (these MUST complete!)
pullSubject.pullAsync(() => {
    return of({key2: 10});
});

// subscribe to the pull subject to receive the merged result of all collectors
pullSubject.subscribe(collected => {
    console.log('got the result', collected);
});

// trigger the collection with pull subject next (you can pass initial or default values for the reducer here, defaults to {})
pullSubject.next();

// deregister a collector with the pull return value
const pullSub = pullSubject.pull(() => {
    return {key: 'value'};
});

pullSub.unsubscribe();
```

## Utilities and Operators

### concatJoin

*Like `forkJoin` but executes streams sequentially*

### batchJoin

*Like `forkJoin` but executes streams sequentially in batches of a specified size, default 5*

### pluckDistinct

*combines `pluck` and `distinctUntilChanged`*

### pluckManyLatest

*plucks several keys and emits all when any of them change*

### pluckManyMerge

*plucks several keys and the key that changed when it changes, along with the key that changed*