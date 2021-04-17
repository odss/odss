import { assert } from 'chai';

import { Bundles } from '@odss/common';
import Bundle from '../src/bundle';

describe('core/bundle', () => {
    it('imports()', () => {
        assert.ok(typeof Bundle === 'function', 'import Bundle');
        assert.ok(Bundles, 'import Bundles');
        assert.ok(Bundles.UNINSTALLED === 1, 'Bundle.UNINSTALLED');
        assert.ok(Bundles.INSTALLED === 2, 'Bundle.INSTALLED');
        assert.ok(Bundles.RESOLVED === 4, 'Bundle.RESOLVED');
        assert.ok(Bundles.STARTING === 8, 'Bundle.STARTING');
        assert.ok(Bundles.STOPPING === 16, 'Bundle.STOPPING');
        assert.ok(Bundles.ACTIVE === 32, 'Bundle.ACTIVE');
    });
    it('meta', () => {
        let bundle = new Bundle(123, undefined, {
            path: 'test',
            name: 'ntest',
        });
        assert.equal(bundle.module.path, 'test');
        assert.equal(bundle.module.name, 'ntest');
        assert.equal(bundle.version, '0.0.0');
    });
});
