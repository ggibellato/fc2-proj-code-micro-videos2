import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { Chip } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { formatFromISO } from '../../util/date';
import categoryHttp from '../../util/http/category-http';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <Chip label="Sim" color="primary" /> : <Chip label="Nao" color="secondary" />
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{formatFromISO(value, 'dd/MM/yyyy')}</span>
            }
        }
    }
]

interface Category {
    id: string;
    name: string;
}

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<Category[]>([]);
    useEffect(() => {
        categoryHttp
            .list<{data: Category[]}>()
            .then(({data}) => setData(data.data));
    }, []);

    return (
        <MUIDataTable 
            title="Listagem de categorias"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;