import { useEffect, useState } from 'react';
import genreHttp from '../../util/http/genre-http';
import { formatFromISO } from '../../util/date';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { ListResponse, Genre } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '37%',
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "16%"
    },
    {
        name: "categories",
        label: "Categorias",
        width: "20%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{value.map( (el:any) => (el.name)).join(",")}</span>;
            }
        }
    },    
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
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
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await genreHttp.list<ListResponse<Genre>>();
                if(isSubscribed) {
                    setData(data.data)
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
                title="Listagem de gêneros"
                columns={columnsDefinition}
                data={data}
                loading={loading}
            />
        </MuiThemeProvider>
    );
};

export default Table;