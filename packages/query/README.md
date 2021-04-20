# squery
Simple filters engine base on LDAP queries [RFC-1960](https://www.ietf.org/rfc/rfc1960.txt)
## Installation
`npm install @stool/query`

## Test
`npm test`

## How to use it

### Simple squery check
```javascript
import squery from '@stool/query';

let check = (query, params) => squery(query).match(params);

assert(
    check('name=*', {name='Jon Snow'}) === true
);
assert(
    check('name=Jon', {name='Jon Snow'}) === false
);
assert(
    check('name=Jon Snow', {name='Jon Snow'}) === true
);
assert(
    check('name=Jon*', {name='Jon Snow'}) === true
);
assert(
    check('name=*Snow', {name='Jon Snow'}) === true
);
assert(
    check('name=*on*', {name='Jon Snow'}) === true
);
assert(
    check('name=Jon Snow', {label='Jon Snow'}) === false
);


```
### Filter collection
```javascript
import squery from '@odss/query';

let filter = (query, list) => squery(query).filter(list);

assert(
    filter('name', [{name='Sansa'}, {name='Jon'}]).length === 2
);
assert(
    filter('name=Jon', [{name='Sansa'}, {name='Jon'}]).length === 1
);
```

## License
Released under the [MIT license](https://github.com/odss/query/blob/master/LICENSE.md).
