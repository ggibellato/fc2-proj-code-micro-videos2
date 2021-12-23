import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { invert } from "lodash";
import { useSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { BadgeNo, BadgeYes } from '../../components/Badge';
import LoadingContext from '../../components/loading/LoadingContext';
import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import { formatFromISO } from '../../util/date';
import categoryHttp from '../../util/http/category-http';
import { Category, ListResponse, IsActiveMap } from '../../util/models';
import * as yup from "../../util/vendor/yup/yup";

const isActiveNames = Object.values(IsActiveMap);

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
        width: "43%",
        options: {
            filter: false
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            filterOptions: {
                names: ['Sim', 'Nao']
            },
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
            filter: false,
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
            filter: false,
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

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); //current:true
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
            createValidationSchema: () => {
                return yup.object().shape({
                    is_active: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !isActiveNames.includes(value)? undefined: value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState: any) => {
                return debouncedState.extraFilter 
                    ? {
                        ...(
                            debouncedState.extraFilter.is_active &&
                            {is_active: debouncedState.extraFilter.is_active}
                        )
                    } 
                    : undefined
            },
            getStateFromURL: (queryParams: any) => {
                return {
                    is_active: queryParams.get('is_active')
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
    const indexColumnIsActive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsActive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];

    const getData = useCallback(async ({search, page, per_page, sort, dir, is_active}) => {
        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(is_active && {is_active: invert(IsActiveMap)[is_active]})
                }
            });
            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch(error) {
            console.error(error);
            if(categoryHttp.isCancelledRequest(error)) {
               return; 
            }
            enqueueSnackbar(
                'Nao foi possível carregar as informações',
                {variant: 'error'}
            );
        }
    }, [enqueueSnackbar, setTotalRecords]);


    //componentDidUpdate
    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir,
            ...(debounceFilterState.extraFilter && debounceFilterState.extraFilter.is_active && {is_active: debounceFilterState.extraFilter.is_active})
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
                title="Listagem de categorias"
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
                            data = {[column as any] : filterList[columnIndex].length ? filterList[columnIndex][0]: null};
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