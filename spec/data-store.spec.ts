import { expect } from 'chai';

import { DataStore } from '../src/data-store';

describe('DataStore', () => {
  describe('#get()', () => {
    it('should get 1', (done: MochaDone) => {
      const store = new DataStore<number>({key: 1});
      store.get('key').subscribe(value => {
        expect(value).to.equal(1);
      }, null, done);

      store.complete();
    });
  });
});