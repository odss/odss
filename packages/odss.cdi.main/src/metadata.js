
const CARDINALITY = ['0..1', '0..n', '1..1', '1..n'];

function prepareProperties(props) {
    let properties = [];
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
        "cardinality": null,
        "policy": null,
        "filter": '',
        "bind": null,
        "unbind": null,
        "update": null
    }, ref);

    if (!ref.interface) {
        throw new Error('Missing "interface" in declared reference');
    }
    ref.name = ref.name || ref.interface;

    if (CARDINALITY.indexOf(ref.cardinality) === -1) {
        throw new Error('Incorect cardinality: "' + ref.cardinality + '". Should be one of: [' + CARDINALITY.join(', ') + ']');
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
        return new Error('Component "' + (config.name || config.specifications) + '" validation error: ' + reason);
    };

    config = Object.assign({
        "specifications": null,
        "activate": "activate",
        "deactivate": "deactivate",
        "modified": "modified",
        "provides": [],
        "requires": [],
        "properties": [],
        "references": []
    }, config);

    if (!config.specifications) {
        throw error('Implementation "specifications" name missing.');
    }
    config.name = config.name || config.specifications;
    let metadata = {};
    try {
        for (let c of Object.keys(config)) {
            let item = config[c];
            switch (c) {
                case 'properties':
                    item = item.concat();
                    break;
                case 'interfaces':
                    //copy
                    item = item.concat();
                    break;
                case 'references':
                    item = prepareReferences(item);
                    break;
            }
            metadata[c] = item;
        }
    } catch (e) {
        throw error(e);
    }
    return metadata;
}
