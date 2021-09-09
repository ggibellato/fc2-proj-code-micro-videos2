import { FormControl, FormControlProps, FormHelperText, Typography } from '@material-ui/core';
import * as React from 'react'
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useCollectionManager from '../../../hooks/useCollectionManager';
import useHttpHandle from '../../../hooks/useHttpHandle';
import castMemberHttp from '../../../util/http/castmember-http';
import { CastMember, ListResponse } from '../../../util/models';

interface CastMemberFieldProps {
    cast_members: CastMember[],
    setCastMembers: (cast_members:CastMember[]) => void,
    error: any,
    disabled?: boolean;
    FormControlProps?: FormControlProps;
}

const CastMemberField: React.FC<CastMemberFieldProps> = (props) => {
    const {
        cast_members, 
        setCastMembers, 
        error, 
        disabled
    } = props;
    const autoCompleteHttp = useHttpHandle();
    const {addItem, removeItem} = useCollectionManager(cast_members, setCastMembers);

    function fetchOptions(searchText: string) {
        return autoCompleteHttp(
            castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: searchText, 
                    all: ""
                }
            })
        )
        .then( data => data.data)
        .catch(error => console.log(error));
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
                    label: "Membro do Elenco",
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
                    {cast_members.map((cast_member, key) => 
                        <GridSelectedItem 
                            key={key} 
                            xs={12}
                            onDelete={() => {
                                removeItem(cast_member);
                            }}
                        >
                            <Typography noWrap={true}>{cast_member.name}</Typography>
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

export default CastMemberField;
