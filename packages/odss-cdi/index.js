const map = new WeakMap();
const getCdi = target => {
    if(!map.has(target)){
        map.set(target, []);
    }
    return map.get(target);
};

function findComponentArgs(name, args){
    let provides = [];
    let isFirst = true;
    while(args.length){
        let first = args.shift();
        if(isFirst && typeof first === 'string'){
            name = first;
        }else{
            provides.push(first);
        }
        isFirst = false;
    }
    return {
        name,
        provides
    };
}

export function Component(...args) {
    return (target, key, descriptor) => {
        let options = findComponentArgs(target.name, args);
        let config = {
            name: options.name,
            provides: options.provides,
            specifications: target,
            properties: [],
            requires: [],
            references: [],
        };
        let items = getCdi(target.prototype);
        let groups = {};
        items.forEach(item => {
            switch(item.type){
                case 'activate':
                case 'deactivate':
                    config[item.type] = item.name;
                    break;
                case 'requires':
                    config[item.type] = item.interfaces;
                    break;
                case 'property':
                    config.properties.push({
                        name: item.name,
                        property: item.property,
                        value: item.value
                    });
                    break;
                case 'bind':
                case 'unbind':
                    let group = groups[item.interface];
                    if(!group){
                        group = groups[item.interface] = {
                            name: config.name+':'+item.name
                        };
                        config.references.push(group);
                    }
                    group.interface = item.interface;
                    group[item.type] = item.name;
                    if(item.cardinality){
                        group.cardinality = item.cardinality;
                    }
                    break;
            }
        });
        groups = null;
        target.__ODSS_CDI__ = config;
    }
}

export function Requires(...interfaces) {
    return function(target, field, descriptor){
        getCdi(target.prototype).push({
            type:'requires',
            interfaces
        });
    }
}

export function Property(name, property, value=null){
    return function(target, field, descriptor){
        getCdi(target.prototype).push({
            type: 'property',
            name,
            property,
            value
        });
    }
}

export function Bind(interfaces, cardinality='0..n'){
    return function(target, name){
        getCdi(target).push({
            type:'bind',
            name,
            interface: interfaces,
            cardinality
        });
    };
}

export function Unbind(interfaces){
    return function(target, name){
        getCdi(target).push({
            type:'unbind',
            name,
            interface : interfaces
        });
    };
}

export function Validate(target, name){
    getCdi(target).push({
        type:'activate',
        name
    });
}

export function Invalidate(target, name){
    getCdi(target).push({
        type:'deactivate',
        name
    });
}

export function Update(target, name){
    getCdi(target).push({
        type:'modified',
        name
    });
}