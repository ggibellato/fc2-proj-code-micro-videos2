import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

export const formatFromISO = (value: string, dateFormat: string ) => {
    return format(parseISO(value), dateFormat);
}
