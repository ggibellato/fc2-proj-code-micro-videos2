function* test() {
    yield "react";
    console.log('eu');
    yield "saga";
}

const iterator = test();

console.log(iterator.next());
console.log(iterator.next());
//console.log(iterator.next());