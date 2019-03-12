import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import '../../src';

chai.use(sinonChai);

chai.config.truncateThreshold = 0;
afterEach(() => {
  sinon.restore();
});
