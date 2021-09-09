import { FormControl, FormControlProps, FormHelperText, makeStyles, Theme, Typography } from '@material-ui/core';
import * as React from 'react'
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useCollectionManager from '../../../hooks/useCollectionManager';
import useHttpHandle from '../../../hooks/useHttpHandle';
import categoryHttp from '../../../util/http/category-http';
import { Category, Genre, ListResponse } from '../../../util/models';
import { getGenresFromCategory } from '../../../util/model-filters';
import { grey } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => ({
    genresSubtitle:{
        color: grey["800"],
        fontSize: '0.8rem'
    }
}));

interface CategoryFieldProps {
    categories: Category[],
    setCategories: (categories:Category[]) => void,
    genres: Genre[],
    error: any,
    disabled?: boolean;
    FormControlProps?: FormControlProps;
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {

    const {categories, setCategories, genres, error, disabled} = props;
    const classes = useStyles();
    const autoCompleteHttp = useHttpHandle();
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);

    function fetchOptions(searchText: string) {
        return autoCompleteHttp(
            categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    genres: genres.map(genre => genre.id).join(','),
                    all: ""
                }
            })
        ).then( data => data.data).catch(error => console.log(error));
    } 

    return (
        <>
            <AsyncAutocomplete 
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    //autoSelect: true,
                    clearOnEscape: true,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    getOptionSelected: (option, value) => option.id === value.id,
                    disabled: disabled === true || !genres.length
                }}
                TextFieldProps={{
                    label: "Categorias",
                    error: error !== undefined
                }}
            />
            <FormControl 
                margin={"normal"}
                fullWidth
                disabled={disabled === true}
                error={error !== undefined}
                {...props.FormControlProps}
            >
                <GridSelected>
                    {
                        categories.map((category, key) => {
                            const generesFromCategory = getGenresFromCategory(genres, category)
                                .map(genre => genre.name)
                                .join(',');
                            return (
                                <GridSelectedItem key={key} onDelete={()=> removeItem(category)} xs={12}>
                                    <Typography noWrap={true}>{category.name}</Typography>
                                    <Typography noWrap={true} className={classes.genresSubtitle}>Gêneros: {generesFromCategory}</Typography>
                                </GridSelectedItem>
                            );
                        }
                    )}
                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }         
            </FormControl>
        </>
    )   
}

export default CategoryField
