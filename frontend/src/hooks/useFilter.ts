import {History} from 'history';
import {isEqual} from 'lodash';
import { MUIDataTableColumn } from "mui-datatables";
import { Dispatch, Reducer, useReducer, useState } from "react";
import {useHistory} from 'react-router';
import { useDebounce } from 'use-debounce';

import { MuiDataTableRefComponent } from "../components/Table";
import reducer, { Creators } from "../store/filter";
import { Actions as FilterActions, State as FilterState } from "../store/filter/types";
import * as yup from '../util/vendor/yup/yup';

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    extraFilter?: ExtraFilter;
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any;
    formatSearchParams: (debouncedState: FilterState) => any;
    createValidationSchema: () => any;
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {

}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const filterManager = new FilterManager({...options, history});
    const INITIAL_STATE = filterManager.getStateFromURL();
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [debounceFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    filterManager.state = filterState;
    filterManager.debouncedState = debounceFilterState;
    filterManager.dispatch = dispatch;

    filterManager.applyOderInColumns();
    return {
        columns: filterManager.columns,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema: any;
    state: FilterState = null as any;
    debouncedState: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    history: History;
    extraFilter?: ExtraFilter;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;

    constructor(options: FilterManagerOptions) {
        const {columns, rowsPerPage, rowsPerPageOptions, history, extraFilter, tableRef} = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.history = history;
        this.extraFilter = extraFilter;
        this.tableRef= tableRef;
        this.createValidationSchema();
    }

    private resetTablePagination() {
        this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
        this.tableRef.current.changePage(0);
    }

    changeSearch(value: string | null) {
        this.dispatch(Creators.setSearch({search: value ?? ''}));
    }

    changePage(page: number) {
        this.dispatch(Creators.setPage({page: page + 1}))
    }

    changeRowsPerPage(perPage:number) {
        this.dispatch(Creators.setPerPage({per_page: perPage}));
    }

    changeColumnSort(changedColumn: string, direction: string) {
        this.dispatch(Creators.setOrder({
            sort: changedColumn, 
            dir: direction.includes('desc') ? 'desc': 'asc'
        }));
        this.resetTablePagination();
    }

    changeExtraFilter(data: any) {
        this.dispatch(Creators.updateExtraFilter(data));
    }

    applyOderInColumns() {
        this.columns = this.columns.map(column => {
            return this.state.order.sort === column.name
              ? {
                  ...column,
                  options: {
                      ...column.options,
                      sortOrder: this.state.order.dir as any
                  }
              }
              : column;
        });
    }

    cleanSearchText(text: any) {
        let cleanText = text;
        if(cleanText && cleanText.value !== undefined){
            cleanText = cleanText.value;
        }
        return cleanText;
    }

    resetFilter() {
        const INITIAL_STATE = {
            ...this.schema.cast({}),
            search: { value: null, update: true },
            order: {
                sort: null,
                dir: null
            },
            extraFilter: undefined,
          };
        this.dispatch(
            Creators.setReset({
              state: INITIAL_STATE,
            })
          );        
        this.resetTablePagination();          
    }

    replaceHistory() {
        this.history.replace({
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: this.debouncedState
        });
    }

    pushHistory() {
        const newLocation = {
            pathName: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: {
                ...this.debouncedState,
                search: this.cleanSearchText(this.debouncedState.search)
            }
        }
        const oldState = this.history.location.state;
        const nextState = this.debouncedState;
        if(isEqual(oldState, nextState)) {
            return;
        }
        this.history.push(newLocation);
    }

    getStateFromURL() {
        const queryParams = new URLSearchParams(this.history.location.search.substr(1));
        return this.schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page')
            },
            order: {
                sort: queryParams.get('sort'),
                dir: queryParams.get('dir')
            },
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromURL(queryParams)
                }
            )
        });
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.state.search);
        return  {
            ...(search && search !== '' && {search: search}),
            ...(this.state.pagination.page !== 1 && {page:this.debouncedState.pagination.page}),
            ...(this.state.pagination.per_page !== 15 && {per_page:this.debouncedState.pagination.per_page}),
            ...(
                this.state.order.sort && {
                    sort: this.debouncedState.order.sort,
                    dir: this.debouncedState.order.dir
                }
            ),
            ...(
                this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)
            )
        };
    }

    private createValidationSchema() {
        this.schema = yup.object().shape( {
            search: yup.string()
                .transform( value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform( value => 
                        isNaN(value) || !this.rowsPerPageOptions.includes(parseInt(value)) ? undefined : value
                    )
                    .default(this.rowsPerPage)
            }),
            order: yup.object().shape({
                sort: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                dir: yup.string()
                    .nullable()
                    .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null),
            }),
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        });
    }
}