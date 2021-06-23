import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { useEffect, useState } from 'react';
import { httpVideo } from '../../util/http';
import { formatFromISO } from '../../util/date';

enum Type {
    Diretor = 1,
    Ator = 2
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Type",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{`${value} - ${Type[value]}`}</span>
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
        httpVideo.get('/cast_members').then(
            response => setData(response.data.data)
        )
    }, []);

    return (
        <MUIDataTable 
            title="Listagem de membros do elenco"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;