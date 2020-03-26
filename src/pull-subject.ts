import { Subject, Observable, zip, forkJoin, of } from 'rxjs';
import { scan, map, distinctUntilChanged, startWith, withLatestFrom, switchMap } from 'rxjs/operators';
import {StateStore} from './state-store';

type CollectorFunction<T> = () => Partial<T>;
type AsyncCollectorFunction<T> = () => Observable<Partial<T>>;

type Collector<T> = [Array<CollectorFunction<T>>, Array<AsyncCollectorFunction<T>>];

export interface PullSubscription {
    unsubscribe: () => void
}

export class PullSubject<T extends object> extends Subject<T> {

    private collectorState = new StateStore<Collector<T>>([[], []]);

    private pullTrigger = new Subject<void>();

    constructor(
        collectorReducer: (collected: Partial<T>, collector: Partial<T>) => Partial<T> = (collected, collector) => ({...collected, ...collector}), 
        reduceInit: Partial<T> = {}
    ) {
        super();

        this.pullTrigger.pipe(
            withLatestFrom(this.collectorState),
            switchMap(([pull, [collectors, asyncCollectors]]) => {
                const async$ = (asyncCollectors.length) ? forkJoin(asyncCollectors.map(c => c())) : of<Partial<T>[]>([]);
                return async$.pipe(
                    map(collected => collected.reduce(collectorReducer, reduceInit)),
                    map(v => 
                        collectors.map(c => c()).reduce(collectorReducer, v)
                    )
                );
            })
        ).subscribe(
            (v: T) => super.next(v),
            e => this.error(e),
            () => this.complete()
        );
    }

    private unpull(collector: CollectorFunction<T> | AsyncCollectorFunction<T>) {
        const modifier = (state: Collector<T>, payload: CollectorFunction<T> | AsyncCollectorFunction<T>) => {
            const syncI = state[0].indexOf((payload as CollectorFunction<T>))
            const asyncI = state[1].indexOf((payload as AsyncCollectorFunction<T>))
            if (syncI > -1) {
                state[0].splice(syncI, 1)
            } else if (asyncI > -1) {
                state[1].splice(asyncI, 1)
            }
            return ([state[0], state[1]] as Collector<T>);
        }
        this.collectorState.modify(collector, modifier)
    }

    pull(collector: CollectorFunction<T>): PullSubscription {
        const modifier = (state: Collector<T>, payload: CollectorFunction<T>) => {
            return ([[...state[0], payload], state[1]] as Collector<T>);
        }
        this.collectorState.modify(collector, modifier)
        return { unsubscribe: () => this.unpull(collector) };
    }

    pullAsync(collector$: AsyncCollectorFunction<T>): PullSubscription {
        const modifier = (state: Collector<T>, payload: AsyncCollectorFunction<T>) => {
            return ([state[0], [...state[1], payload]] as Collector<T>);
        }
        this.collectorState.modify(collector$, modifier)
        return { unsubscribe: () => this.unpull(collector$) };
    }

    next() {
        this.pullTrigger.next();
    }

}