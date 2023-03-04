
async function s1() {
    console.log('s1.pre');
    const s = new Promise(resolve => {
        console.log('promise');
        setTimeout(resolve, 1000);
    });
    console.log('s1.post');
    return s;
}
async function s2() {
    console.log('s2.pre');
    s1();
    console.log('s2.post');
}

s2();

