import { FormControl, FormControlProps, FormHelperText, Typography } from '@material-ui/core';
import * as React from 'react'
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useCollectionManager from '../../../hooks/useCollectionManager';
import useHttpHandle from '../../../hooks/useHttpHandle';
import genreHttp from '../../../util/http/genre-http';
import { getGenresFromCategory } from '../../../util/model-filters';
import { Category, Genre, ListResponse } from '../../../util/models';

interface GenreFieldProps {
    genres: Genre[],
    setGenres: (genres:Genre[]) => void,
    categories: Category[],
    setCategories: (categories:Category[]) => void,
    error: any,
    disabled?: boolean;
    FormControlProps?: FormControlProps;
}

const GenreField: React.FC<GenreFieldProps> = (props) => {
    const {
        genres, 
        setGenres, 
        categories, 
        setCategories,
        error, 
        disabled
    } = props;
    const autoCompleteHttp = useHttpHandle();
    const {addItem, removeItem} = useCollectionManager(genres, setGenres);
    const {removeItem: removeCategory} = useCollectionManager(categories, setCategories);

    function fetchOptions(searchText: string) {
        return autoCompleteHttp(
            genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search: searchText, 
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
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled
                }}
                TextFieldProps={{
                    label: "Gêneros",
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
                    {genres.map((genre, key) => 
                        <GridSelectedItem 
                            key={key} 
                            xs={12}
                            onDelete={() => {
                                const categoriesWithOneGenre = categories
                                    .filter(category => {
                                        const genresFromCategory = getGenresFromCategory(genres, category);
                                        return genresFromCategory.length === 1 && genres[0].id === genre.id;
                                    });
                                categoriesWithOneGenre.forEach(cat => removeCategory(cat));
                                removeItem(genre);
                            }}
                        >
                            <Typography noWrap={true}>{genre.name}</Typography>
                        </GridSelectedItem>
                    )}
                </GridSelected>
                {   
                    error && <FormHelperText>{error.message}</FormHelperText>
                }         
            </FormControl>
        </>
    )   
}

export default GenreField
