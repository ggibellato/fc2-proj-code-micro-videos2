const { createStore, applyMiddleware } = require('redux');
const { default: createSagaMiddleware } = require('redux-saga');
const {take, put, call, actionChannel, debounce, select, all, fork} = require('redux-saga/effects');
const axios = require('axios');

//console.log('1');

function reducer(state = {value: 9}, action) {
    //console.log('reducer ', action);
    if(action.type === 'acaoY') {
        return {...state, text: action.value};
    }
    if(action.type === 'acaoX') {
        return {value: action.value};
    }
    return state;
}

//console.log('2');

function* sagaNonBlocking() {
    console.log('antes do call');
    const search = 'a';
    const {data} = yield call(
        () => axios.get('http://nginx/api/videos?search=' + search)
    );
    console.log('depois do call');
}

function* rootSaga() {
    yield all([
        helloWorld(),
        debounceSearch() // este nao vai terminar por que e um debounce que fica rodando sempre
    ]);
    console.log('acabou'); // nao vai executar por causa do debounce
}

function* helloWorld() {
    console.log('Hello World');
}

function* searchData(action) {
    //console.log('Hello World');
    //const channel = yield actionChannel('acaoY');
    //console.log(channel);
    //while(true) {
        console.log(yield select((state) => state.text));
        //console.log('antes');
        //const action = yield take(channel);
        //const search = action.value;

        yield fork(sagaNonBlocking);
        console.log('depois do fork');

        // const [response1, response2] = yield all([
        //     call(
        //         () => axios.get('http://nginx/api/videos?search=' + search)
        //     ),
        //     call(
        //         () => axios.get('http://nginx/api/videos?search=' + search)
        //     )
        // ]);

        // console.log(JSON.stringify(response1.data), JSON.stringify(response2.data));

        // const {data} = yield call(
        //     () => axios.get('http://nginx/api/videos?search=' + search)
        // );
        // const {data1} = yield call(
        //     () => axios.get('http://nginx/api/videos?search=' + search)
        // );
        //console.log(search);
        //console.log(data);
        //console.log('depois');
        yield put({
            type: 'acaoX',
            value: 'novo valor'
        });
    //}
}

function* debounceSearch() {
    yield debounce(1000, 'acaoY', searchData);
}

//console.log('3');
const sagaMiddleware = createSagaMiddleware();

//console.log('4');
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);

//console.log('5');
sagaMiddleware.run(rootSaga);

//console.log('6');
const action = (type, value) => store.dispatch({type, value});

// action('acaoY', 'l');
// action('acaoY', 'lu');
// action('acaoY', 'lui');
// action('acaoY', 'luiz');
// action('acaoY', 'luiza');

console.log(store.getState());