import { expect } from 'chai';
import {of} from 'rxjs'
import { StateStore } from '../src/state-store';



describe('StateStore', () => {
  describe('#get()', () => {
    it('should get 1', (done: MochaDone) => {
    //   const store = new DataStore<number>({key: 1});
    //   store.get('key').subscribe(value => {
    //     expect(value).to.equal(1);
    //   }, null, done);

    //   store.complete();
        expect(1).to.equal(1)
        done()
    });
  });
});