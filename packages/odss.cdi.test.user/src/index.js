export function start(ctx) {
    setTimeout(() => {
        ctx.registerService('IUserService', 'service user', {name:'user'});
    }, 2000)
}

export function stop(ctx) {
}


