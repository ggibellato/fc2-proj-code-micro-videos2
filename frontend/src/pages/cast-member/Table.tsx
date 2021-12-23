import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { invert } from "lodash";
import { useSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingContext from '../../components/loading/LoadingContext';

import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import { formatFromISO } from '../../util/date';
import castMemberHttp from '../../util/http/castmember-http';
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import * as yup from "../../util/vendor/yup/yup";

const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '27%',
        options: {
            filter: false
        }
    },
    {
        name: "type",
        label: "Type",
        width: '20%',
        options: {
            filterOptions: {
                names: castMemberNames
            },
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{`${value} - ${CastMemberTypeMap[value as never]}`}</span>
            },
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
        width: "13%",
        options: {
            sort: false,
            filter: false,
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15,25,50]

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); //current:true    
    const [data, setData] = useState<CastMember[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
            createValidationSchema: () => {
                return yup.object().shape({
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !castMemberNames.includes(value)? undefined: value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState:any) => {
                return debouncedState.extraFilter 
                    ? {
                        ...(
                            debouncedState.extraFilter.type &&
                            {type: debouncedState.extraFilter.type}
                        )
                    } 
                    : undefined
            },
            getStateFromURL: (queryParams:any) => {
                return {
                    type: queryParams.get('type')
                }
            }
    }),[]);

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
        rowsPerPageOptions: rowsPerPageOptions,
        extraFilter
    });
    const searchText = cleanSearchText(debounceFilterState.search);
    const indexColumnType = columns.findIndex(c => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const getData = useCallback(async ({search, page, per_page, sort, dir, type}) => {
        try {
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(type && {type: invert(CastMemberTypeMap)[type]})
                }
            });
            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch(error) {
            console.error(error);
            if(castMemberHttp.isCancelledRequest(error)) {
               return; 
            }
            enqueueSnackbar(
                'Nao foi possível carregar as informações',
                {variant: 'error'}
            );
        }
    }, [enqueueSnackbar, setTotalRecords]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir,
            ...(debounceFilterState.extraFilter && debounceFilterState.extraFilter.type && {type: debounceFilterState.extraFilter.type})
        });
        return () => {
            subscribed.current = false;
        };
    }, [
        getData,
        searchText, 
        debounceFilterState.pagination.page, 
        debounceFilterState.pagination.per_page, 
        debounceFilterState.order,
        debounceFilterState.extraFilter
    ]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)}>
            <DefaultTable 
                title="Listagem de membros do elenco"
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
                        var data:any = {};
                        if(column) {
                            data = {[column as never] : filterList[columnIndex].length ? filterList[columnIndex][0]: null};
                        } else {
                            columns.forEach(c => {
                                data[c.name as never] = null;
                            });
                        }
                        filterManager.changeExtraFilter(data);
                    },
                    customToolbar: () => (
                        <FilterResetButton handleClick={() => filterManager.resetFilter()} />
                    ),
                    onSearchChange: searchText => { 
                        filterManager.changeSearch(searchText);
                    },
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