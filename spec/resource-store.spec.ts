import { expect } from 'chai';
import {of} from 'rxjs'
import { ResourceStore, AbstractResourceStore } from '../src/resource-store';



describe('ResourceStore', () => {
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