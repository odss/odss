import {Framework} from 'odss-framework';


function ready(){
    return new Promise(resolve => {
        if(document.readyState === 'complete'){
            resolve();
        }else{
            document.addEventListener("DOMContentLoaded", loaded, false);
            window.addEventListener("load", loaded, false);
        }
        function loaded(){
            document.removeEventListener("DOMContentLoaded", loaded, false);
            window.removeEventListener("load", loaded, false);
            resolve();
        }
    });
}

export async function boot(options = {}){
    await ready();
    
    let framework = new Framework(options.properties);
    framework.start();
    let bundles = options.bundles || [];
    // await Promise.all(bundles.map(location =>
    //     framework.installBundle(location, true)
    // ));
    for(let bundle of bundles){
        await framework.installBundle(bundle, true);
    }
    return framework;
}
