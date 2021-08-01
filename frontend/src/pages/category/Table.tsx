import { useEffect, useRef, useState } from 'react';
import { formatFromISO } from '../../util/date';
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import { INITIAL_STATE, Creators } from '../../store/filter';
import useFilter from '../../hooks/useFilter';

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
        width: "43%"
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
        label: "Ações",
        width: "13%",
        options: {
            sort: false,
            customBodyRender(value, tableMeta, updateValue) {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    }
]

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15,25,50]


const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true); //current:true
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const {
        columns, 
        filterManager, 
        filterState, 
        debounceFilterState,
        dispatch, 
        totalRecords, 
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions
    });

    useEffect(()=>{
        filterManager.replaceHistory();
    }, []);

    //componentDidUpdate
    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        };
    }, [
        filterManager.cleanSearchText(debounceFilterState.search), 
        debounceFilterState.pagination.page, 
        debounceFilterState.pagination.per_page, 
        debounceFilterState.order
    ]);

    async function getData() {
        setLoading(true);
        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir
                }
            });
            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
                // setSearchState( prevState => ({
                //     ...prevState,
                //     pagination: {
                //         ...prevState.pagination,
                //         total: data.meta.total
                //     }
                // }))                
            }
        } catch(error) {
            console.error(error);
            if(categoryHttp.isCancelledRequest(error)) {
               return; 
            }
            snackbar.enqueueSnackbar(
                'Nao foi possível carregar as informações',
                {variant: 'error'}
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)}>
            <DefaultTable 
                title="Listagem de categorias"
                columns={columns}
                data={data}
                loading ={loading}
                debouncedSearchTime={debouncedSearchTime}
                options ={{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton handleClick={() => { 
                            dispatch(Creators.setReset({state:INITIAL_STATE}))
                        }} />
                    ),
                    onSearchChange: searchText => filterManager.changeSearch(searchText),
                    onChangePage: page => filterManager.changePage(page),
                    onChangeRowsPerPage: perPage => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string)  =>  
                        filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;