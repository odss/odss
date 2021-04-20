export function l() {

for(let i = 0;i<10;i+=1){
    setTimeout(() => console.log(i));
}
}
export async function a(){
    await 1;
}
export function* g() {
    yield 1;
}
export class C {
}
