
export const nextPid = (() => {
    let id = 0;
    return () => id+=1;
})();