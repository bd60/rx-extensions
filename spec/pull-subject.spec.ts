import { expect } from 'chai';

import { PullSubject } from '../src/pull-subject';
import { of } from 'rxjs';

describe('PullSubject', () => {
  interface MyType {
    key: string,
    key2: number
  }
  describe('#pull()', () => {
    it('should get the full value', (done: MochaDone) => {
      const pullSubject = new PullSubject<MyType>();

      pullSubject.pull(() => {
        return {key: 'value'};
      });

      pullSubject.pull(() => {
        return {key2: 10};
      });

      pullSubject.subscribe(value => {
        expect(value).to.deep.equal({key: 'value', key2: 10})
      }, null, done);

      pullSubject.next();

      pullSubject.complete();
    });
  });

  describe('#pullAsync()', () => {
    it('should get the full value', (done: MochaDone) => {
      const pullSubject = new PullSubject<MyType>();

      pullSubject.pull(() => {
        return {key: 'value'};
      });

      pullSubject.pullAsync(() => {
        return of({key2: 10});
      });

      pullSubject.subscribe(value => {
        expect(value).to.deep.equal({key: 'value', key2: 10})
      }, null, done);

      pullSubject.next();

      pullSubject.complete();
    });
  });

  describe('#unpull()', () => {
    it('should not get the full value', (done: MochaDone) => {

      const pullSubject = new PullSubject<MyType>();
      
      const unpull1 = pullSubject.pull(() => {
        return {key: 'value'};
      });

      unpull1.unsubscribe();

      pullSubject.pull(() => {
        return {key2: 10};
      });

      pullSubject.subscribe(value => {
        expect(value).to.deep.equal({key2: 10})
      }, null, done);

      pullSubject.next();

      pullSubject.complete();
    });
  });
});