import { expect } from 'chai';
import {of} from 'rxjs'
import {batchJoin, concatJoin, pluckDistinct, pluckManyLatest, pluckManyMerge} from '../src/rx-utilities';


describe('RxUtilities', () => {
  describe('#batchJoin()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });

  describe('#concatJoin()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });

  describe('#pluckDistinct()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });

  describe('#pluckManyLatest()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });

  describe('#pluckManyMerge()', () => {
    it('should get 1', (done: MochaDone) => {
        expect(1).to.equal(1)
        done()
    });
  });
});