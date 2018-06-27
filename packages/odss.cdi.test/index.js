import {Component, Bind, Unbind, Requires} from 'odss-cdi';

class ISpellDictionary{
    check_word(word) {

    }
}
class ISpellChecker {
    check(passage, language='en'){

    }
}
@Component(ISpellDictionary)
export class EnglishSpellDictionary {

    activate(ctx){
        this.dictionary = ["hello", "world", "welcome", "to", "the", "odss", "test"];
    }
    deactivate(ctx){
        this.dictionary = null;
    }
    check_word(word) {
        return this.dictionary.indexOf(word) !== -1;
    }
}

@Component(ISpellDictionary)
export class PolishSpellDictionary {
    activate(ctx){
        this.dictionary = ["witaj", "świecie", "witaj", "w", "odss", "tescie"];
    }
    deactivate(ctx){
        this.dictionary = null;
    }
    check_word(word) {
        return this.dictionary.indexOf(word) !== -1;
    }
}


@Component(ISpellChecker)
export class SpellChecker {
    constructor() {
        this.languages = new Map();
    }
    @Bind(ISpellDictionary)
    add(service, ref) {
        let language = ref.property('language');
        this.languages.set(language, service);

    }
    @Unbind(ISpellDictionary)
    remove(service, ref) {
        let language = ref.property('language');
        this.languages.delete(language);
    }
    activate(){
        console.log('A spell checker has been started')
    }
    deactivate(){
        console.log('A spell checker has been stopped')
    }
}
