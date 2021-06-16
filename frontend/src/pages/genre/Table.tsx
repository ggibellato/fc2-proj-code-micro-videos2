import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { Chip } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { httpVideo } from '../../util/http';
import { formatFromISO } from '../../util/date';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                console.log(value);
                return <span>{value.map( (el:any) => (el.name)).join(",")}</span>;
            }
        }
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

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get('/genres').then(
            response => setData(response.data.data)
        )
    }, []);

    return (
        <MUIDataTable 
            title="Listagem de gêneros"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;