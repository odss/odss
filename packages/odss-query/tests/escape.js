import {escape} from '../src/index';

//https://www.owasp.org/index.php/Preventing_LDAP_Injection_in_Java
QUnit.test('escape', assert => {
    assert.equal(escape('Helloé'), 'Helloé', 'No special characters to escape');
    assert.equal(escape('# Helloé'), '\\# Helloé', 'leading #');
    assert.equal(escape(' Helloé'), '\\ Helloé', 'leading space');
    assert.equal(escape('Helloé '), 'Helloé\\ ', 'trailing space');
    assert.equal(escape('   '), '\\  \\ ', 'only 3 spaces');
    assert.equal(escape(' Hello\\ + , "World" ; '), '\\ Hello\\\\ \\+ \\, \\"World\\" \\;\\ ', 'Christmas Tree DN');
});
