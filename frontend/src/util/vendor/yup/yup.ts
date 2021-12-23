/* eslint-disable no-template-curly-in-string */
import {setLocale} from 'yup';

setLocale({
    mixed: {
        required: '${path} é requerido',
        notType: '${path} é inválido'
    },
    string: {
        max: '${path} precisa ter no máximo ${max}'
    },
    number: {
        min: '${path} precisa ser no minimo ${min}'
    },
    array: {
        min: '${path} precisa ter pelo menos ${min} items'
    }
});

export * from 'yup';