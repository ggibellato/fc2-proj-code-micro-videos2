import { FormControl, FormControlProps, FormHelperText, Typography } from '@material-ui/core';
import React, {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from 'react'
import AsyncAutocomplete, {AsyncAutocompleteComponent} from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelectedItem';
import useCollectionManager from '../../../hooks/useCollectionManager';
import useHttpHandle from '../../../hooks/useHttpHandle';
import castMemberHttp from '../../../util/http/castmember-http';
import { CastMember, ListResponse } from '../../../util/models';

interface CastMemberFieldProps extends RefAttributes<CastMemberFieldComponent> {
    cast_members: CastMember[],
    setCastMembers: (cast_members:CastMember[]) => void,
    error: any,
    disabled?: boolean;
    FormControlProps?: FormControlProps;
}

export interface CastMemberFieldComponent {
    clear: () => void
}

const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>((props, ref) => {
    const {
        cast_members, 
        setCastMembers, 
        error, 
        disabled
    } = props;
    const autoCompleteHttp = useHttpHandle();
    const {addItem, removeItem} = useCollectionManager(cast_members, setCastMembers);
    const autoCompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;

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
    
    useImperativeHandle(ref, () => ({
        clear: () => autoCompleteRef.current.clear()        
    }));

    return (
        <>
            <AsyncAutocomplete 
                ref={autoCompleteRef}
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
                            xs={6}
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
});

export default CastMemberField;
