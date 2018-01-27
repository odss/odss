
export function start(ctx) {
    setTimeout(() => {
        ctx.registerService('IApp', 'app test', {name:'name'});
    }, 1000)
}

export function stop(ctx) {
}


