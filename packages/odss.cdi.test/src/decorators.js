let map = new WeakMap();

function getCdi(target){
    if(!map.has(target)){
        map.set(target, []);
    }
    return map.get(target);
}


let cdi = function di(name, interfaces, ...params){
    return function(target, key, descriptor){
        let items = getCdi(target.prototype);
        let config = {
            "name":name,
            "class": target,
            "interfaces":interfaces || [],
            "references":[]
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
};
cdi.assign = function(interfaces){
    return function(target, key, descriptor){
        getCdi(target).push({
            type:'assign',
            name: key,
            interface: interfaces
        });
    }
};
cdi.bind = function(interfaces, cardinality){
    return function(target, key, descriptor){
        getCdi(target).push({
            type:'bind',
            name: key,
            interface : interfaces,
            cardinality: cardinality
        });
    };
};
cdi.unbind = function(interfaces){
    return function(target, key, descriptor){
        getCdi(target).push({
            type:'unbind',
            name: key,
            interface : interfaces
        });
    };
};
cdi.activate = function(target, key, descriptor){
    getCdi(target).push({
        type:'activate',
        name: key
    });
};
cdi.deactivate = function(target, key){
    getCdi(target).push({
        type:'deactivate',
        name: key
    });
};
export default cdi;
