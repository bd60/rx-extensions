import {DataStore} from '../src/data-store';

import { expect } from 'chai';

describe('DataStore', () => {
  describe('#get()', () => {
    it('should get undefined and then 1', (done: MochaDone) => {
      const store = new DataStore<number>();
      store.set('key', 1);
      store.get('key').subscribe(value => {
        expect(value).to.equal(1)
      }, null, done)

      store.complete();
    });
  });
});