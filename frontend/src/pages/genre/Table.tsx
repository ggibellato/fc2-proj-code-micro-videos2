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
import genreHttp from '../../util/http/genre-http';
import { ListResponse, Genre, Category, IsActiveMap } from '../../util/models';
import * as yup from "../../util/vendor/yup/yup";

const isActiveNames = Object.values(IsActiveMap);

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '25%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "25%",
        options: {
            filter: false
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "20%",
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
        label: "Acoes",
        width: "8%",
        options: {
            sort: false,
            filter: false,
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15,25,50]


const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true); //current:true    
    const [data, setData] = useState<Genre[]>([]);
    const [, setCategories] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value ==='' ? undefined: value.split(',');
                        })
                        .default(null),
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
                            debouncedState.extraFilter.categories && {categories: debouncedState.extraFilter.categories.join(',')}
                        ),
                        ...(
                            debouncedState.extraFilter.is_active && {is_active: debouncedState.extraFilter.is_active}
                        )
                    } 
                    : undefined
            },
            getStateFromURL: (queryParams: any) => {
                return {
                    categories: queryParams.get('categories'),
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
    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];
    const indexColumnIsActive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsActive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];

    const getData = useCallback(async ({search, page, per_page, sort, dir, categories, is_active}) => {
        try {
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(categories && {categories: categories.join(',')}),
                    ...(is_active && {is_active: invert(IsActiveMap)[is_active]})
                }
            });
            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
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
    }, [enqueueSnackbar, setTotalRecords]);

    useEffect(()=> {
        let isSubscribed = true;
        (async () => {
            try {
                if(isSubscribed) {
                    const {data} = await categoryHttp.list<ListResponse<Category>>({queryParams: {all:''}});
                    setCategories(data.data);
                    (columnCategories.options as any).filterOptions.names = data.data.map(category => category.name);
                }

            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'Nao foi poss??vel carregar as informa????es',
                    {variant: 'error'}
                );
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, [enqueueSnackbar, columnCategories.options])

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir,
            ...(debounceFilterState.extraFilter && debounceFilterState.extraFilter.categories && {categories: debounceFilterState.extraFilter.categories.join(',')}),
            ...(debounceFilterState.extraFilter && debounceFilterState.extraFilter.is_active && {is_active: invert(IsActiveMap)[debounceFilterState.extraFilter.is_active]})
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
                title="Listagem de g??neros"
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
                        filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;