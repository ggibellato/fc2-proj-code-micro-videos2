import {setLocale} from 'yup';

setLocale({
    mixed: {
        // eslint-disable-next-line
        required: '${path} é requerido',
        // eslint-disable-next-line
        notType: '${path} é inválido'
    },
    string: {
        // eslint-disable-next-line
        max: '${path} precisa ter no máximo ${max}'
    },
    number: {
        // eslint-disable-next-line
        min: '${path} precisa ser no minimo ${min}'
    },
    array: {
        // eslint-disable-next-line
        min: '${path} precisa ter pelo menos ${min} items'
    }
});

export * from 'yup';