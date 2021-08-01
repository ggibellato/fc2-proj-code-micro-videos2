import { useEffect, useState } from 'react';
import castMemberHttp from '../../util/http/castmember-http';
import { formatFromISO } from '../../util/date';
import { CastMember, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';

enum Type {
    Diretor = 1,
    Ator = 2
}

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '27%'
    },
    {
        name: "type",
        label: "Type",
        width: '20%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{`${value} - ${Type[value]}`}</span>
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{formatFromISO(value, 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Acoes",
        width: "13%",
        options: {
            sort: false,
            customBodyRender(value, tableMeta, updateValue) {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    }
]

type Props = {};
const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                if(isSubscribed) {
                    setData(data.data);
                }
            } catch(error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Nao foi possível carregar as informações',
                    {variant: 'error'}
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        };
    }, [snackbar]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)}>
            <DefaultTable 
                title="Listagem de membros do elenco"
                columns={columnsDefinition}
                data={data}
                loading ={loading}
            />
        </MuiThemeProvider>
    );
};

export default Table;