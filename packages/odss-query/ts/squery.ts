import {parse, prepare} from './parser';


export default function squery(query) {
    if(typeof query === 'string'){
        return parse(query);
    }
    if(typeof query === 'object'){
        return prepare(query);
    }
    throw new TypeError('Incorrect query type. Expected string or object.');
}
