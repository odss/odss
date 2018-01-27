let map = new WeakMap();

const getCdi = target => {
    if(!map.has(target)){
        map.set(target, []);
    }
    return map.get(target);
};

export function Component(name, interfaces=[], ...params){
    return function(target, key, descriptor){
        let items = getCdi(target.prototype);
        let config = {
            name,
            specifications: target,
            interfaces,
            references: [],
            properties: []
        };
        let groups = {};
        items.forEach(item => {
            switch(item.type){
                case 'assign':
                    config.references.push({
                        name: name+':'+item.name,
                        assign: item.name,
                        interface: item.interface
                    });
                    break;
                case 'activate':
                case 'deactivate':
                    config[item.type] = item.name;
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
                            name: name+':'+item.name
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
        target.$cdi = config;
    }
}

export function Assign(name, interface_){
    return function(target, field, descriptor){
        getCdi(target.prototype).push({
            type:'assign',
            name,
            interface: interface_
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

export function Bind(interfaces, cardinality){
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
