import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import DeleteDialog from '../../components/DeleteDialog'
import useFilter from '../../hooks/useFilter';
import { formatFromISO } from '../../util/date';
import genreHttp from '../../util/http/genre-http';
import videoHttp from '../../util/http/video-http';
import { ListResponse, Video } from '../../util/models';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '37%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "title",
        label: "Titulo",
        width: "20%",
        options: {
            filter: false
        }
    },
    {
        name: "genres",
        label: "Generos",
        width: "15%",
        options: {
            filterType: "multiselect",
            filterOptions: {
                names: []
            },
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{value?.map( (el:any) => (el.name)).join(",")}</span>;
            }
        }
    },    
    {
        name: "categories",
        label: "Categorias",
        width: "15%",
        options: {
            filterType: "multiselect",
            filterOptions: {
                names: []
            },
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{value?.map( (el:any) => (el.name)).join(", ")}</span>;
            }
        }
    },    
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{formatFromISO(value, 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Acoes",
        width: "3%",
        options: {
            sort: false,
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
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

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); //current:true    
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;    
    const {
        columns, 
        filterManager,
        cleanSearchText,
        filterState, 
        debounceFilterState,
        totalRecords, 
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        tableRef: tableRef,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions
    });
    const searchText = cleanSearchText(debounceFilterState.search);

    const getData = useCallback(async ({search, page, per_page, sort, dir}) => {
        try {
            const {data} = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir
                }
            });
            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
                if(openDeleteDialog) {
                    setOpenDeleteDialog(false);
                }
            }
        } catch(error) {
            console.error(error);
            if(genreHttp.isCancelledRequest(error)) {
               return; 
            }
            enqueueSnackbar(
                'Nao foi poss??vel carregar as informa????es',
                {variant: 'error'}
            );
        }
    }, [enqueueSnackbar, openDeleteDialog, setOpenDeleteDialog, setTotalRecords]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir
        });
        return () => {
            subscribed.current = false;
        };
    }, [
        getData,
        searchText, 
        debounceFilterState.pagination.page, 
        debounceFilterState.pagination.per_page, 
        debounceFilterState.order
    ]);

    function deleteRows(confirmed: boolean) {
        if(!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map((value) => data[value.index].id)
            .join(',');
        videoHttp
            .deleteCollection({ids})
            .then(response => {
                enqueueSnackbar('Registros excluido com sucesso', {
                    variant: 'success'
                });
                if( filterState.pagination.page > 1 
                    && rowsToDelete.data.length === filterState.pagination.per_page) {
                    const page = filterState.pagination.page -2;
                    filterManager.changePage(page);
                }
                else {
                    getData({
                        search: searchText,
                        page: debounceFilterState.pagination.page,
                        per_page: debounceFilterState.pagination.per_page,
                        sort: debounceFilterState.order.sort,
                        dir: debounceFilterState.order.dir
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                enqueueSnackbar(
                    'Nao foi possivel excluir os registros',
                    {variant: 'error'}
                );
            });
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
            <DefaultTable 
                title="Listagem de videos"
                columns={columns}
                data={data}
                loading ={loading}
                debouncedSearchTime={debouncedSearchTime}
                ref={tableRef}
                options ={{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column as any] : filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton handleClick={() => filterManager.resetFilter()} />
                    ),
                    onSearchChange: searchText => filterManager.changeSearch(searchText),
                    onChangePage: page => filterManager.changePage(page),
                    onChangeRowsPerPage: perPage => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string)  =>  
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted: { 
                                        lookup: { [dataIndex: number]: boolean };
                                        data: Array<{ index: number; dataIndex: number }>;
                                    }, newTableData: any[]) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;
                    }
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;