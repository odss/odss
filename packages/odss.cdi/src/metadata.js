
const CARDINALITY = ['0..1', '0..n', '1..1', '1..n'];

function prepareProperties(props) {
    let properties = {};
    for (let i in props) {
        Object.defineProperty(properties, i, {
            enumerable: true,
            value: props[i]
        });
    }
    return properties;
}
function prepareReferences(refs) {
    let references = [];
    for (let i = 0; i < refs.length; i++) {
        references.push(prepareReference(refs[i]));
    }
    return references;
}

function prepareReference(ref) {
    ref = Object.assign({}, {
        "name": null,
        "assign": null,
        "interface": null,
        "cardinality": '1..1',
        "policy": null,
        "filter": '',
        "bind": null,
        "unbind": null,
        "updated": null
    }, ref);

    if (!ref.interface) {
        throw new Error('Missing "interface" in declared reference');
    }
    ref.name = ref.name || ref.interface;

    if (CARDINALITY.indexOf(ref.cardinality) === -1) {
        throw new Error('Incorect cardinality: "' + ref.cardinality + '". Should be one of: [' + CARDINALITY + ']');
    }

    let reference = {};
    for (let r in ref) {
        Object.defineProperty(reference, r, {
            enumerable: true,
            value: ref[r]
        });
    }
    return reference;
}

export default function metadata(config) {

    if (!config) {
        throw new Error('Missing metadata');
    }

    let error = function(reason) {
        return new Error('Component "' + (config.name || config.class) + '" validation error: ' + reason);
    };

    config = Object.assign({
        "name": null,
        "class": null,
        "enabled": true,
        "immediate": false,
        "activate": "activate",
        "deactivate": "deactivate",
        "modified": "modified",
        "interfaces": [],
        "properties": {},
        "references": []
    }, config);

    if (!config.class) {
        throw error('Implementation "class" name missing.');
    }
    config.name = config.name || config.class;
    let metadata = {};
    try {
        for (let c in config) {
            let item = config[c];
            switch (c) {
                case 'properties':
                    item = prepareProperties(item);
                    break;
                case 'interfaces':
                    //copy
                    item = item.concat();
                    break;
                case 'references':
                    item = prepareReferences(item);
                    break;
            }
            Object.defineProperty(metadata, c, {
                enumerable: true,
                value: item
            });
        }
    } catch (e) {
        throw error(e);
    }
    return metadata;
}