import { expect } from 'chai';
import {of} from 'rxjs'
import { ArrayStore} from '../src/array-store';



describe('ArrayStore', () => {
  describe('#get()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });
});