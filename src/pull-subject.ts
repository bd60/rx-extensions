import { Subject, Observable, zip, forkJoin, of } from 'rxjs';
import { scan, map, distinctUntilChanged, startWith, withLatestFrom, switchMap } from 'rxjs/operators';

type CollectorFunction<T> = () => Partial<T>
type AsyncCollectorFunction<T> = () => Observable<Partial<T>>

type Collector<T> = [Array<CollectorFunction<T>>, Array<AsyncCollectorFunction<T>>]

export interface PullSubscription {
    unsubscribe: () => void
}

export class PullSubject<T extends object> extends Subject<T> {

    private addCollectorSource = new Subject<CollectorFunction<T>>();
    private addAsyncCollectorSource = new Subject<AsyncCollectorFunction<T>>();
    private removeCollectorSource = new Subject<CollectorFunction<T> | AsyncCollectorFunction<T>>();

    private collectors$: Observable<Collector<T>> = zip(this.addCollectorSource, this.addAsyncCollectorSource, this.removeCollectorSource).pipe(
        scan((collectors: Collector<T>, [addCollector, addAsynCollector, removeCollector]) => {
            if (addCollector) {
                return [[...collectors[0], addCollector], collectors[1]]
            } else if (addAsynCollector) {
                return [collectors[0], [...collectors[1], addAsynCollector]]
            } else if (removeCollector) {
                const syncI = collectors[0].indexOf((removeCollector as CollectorFunction<T>))
                const asyncI = collectors[1].indexOf((removeCollector as AsyncCollectorFunction<T>))
                if (syncI > -1) {
                    collectors[0].splice(syncI, 1)
                } else if (asyncI > -1) {
                    collectors[1].splice(asyncI, 1)
                }
                collectors = [collectors[0], collectors[1]];
            }
            return collectors
        }, [[], []]),
        distinctUntilChanged(),
        startWith<Collector<T>>([[], []])
    );

    private pullSource = new Subject<void>();

    constructor(
        collectorReducer: (collected: Partial<T>, collector: Partial<T>) => Partial<T> = (collected, collector) => ({...collected, ...collector}), 
        reduceInit: Partial<T> = {}) {
        super()

        this.pullSource.pipe(
            withLatestFrom(this.collectors$),
            switchMap(([pull, [collectors, asyncCollectors]]) => {
                const async$ = (asyncCollectors.length) ? forkJoin(asyncCollectors.map(c => c())) : of<Partial<T>[]>([])
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
        this.removeCollectorSource.next(collector)
        this.addAsyncCollectorSource.next()
        this.addCollectorSource.next()
    }

    pull(collector: CollectorFunction<T>): PullSubscription {
        this.addCollectorSource.next(collector);
        this.addAsyncCollectorSource.next()
        this.removeCollectorSource.next()
        return { unsubscribe: () => this.unpull(collector) };
    }

    pullAsync(collector$: AsyncCollectorFunction<T>) {
        this.addAsyncCollectorSource.next(collector$);
        this.addCollectorSource.next()
        this.removeCollectorSource.next()
        return { unsubscribe: () => this.unpull(collector$) };
    }

    next() {
        this.pullSource.next();
    }

}