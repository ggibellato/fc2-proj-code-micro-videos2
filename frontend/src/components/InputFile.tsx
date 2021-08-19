import { InputAdornment, TextField, TextFieldProps } from '@material-ui/core';
import React, { MutableRefObject, useImperativeHandle, useRef, useState } from 'react';

export interface InputFileProps {
    ButtonFile: React.ReactNode;
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
}

export interface InputFileComponent {
    openWindow: () => void;
}

const InputFile = React.forwardRef<InputFileComponent, InputFileProps>((props, ref) => {

    const fileRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [fileName, setFileName] = useState('');

    useImperativeHandle(ref, () => ({ 
        openWindow: () => fileRef.current.click()
    }));

    const textFieldProps: TextFieldProps = {
        variant:'outlined',
        ...props.TextFieldProps,
        InputProps:{
            ...(props.TextFieldProps && props.TextFieldProps.InputProps &&
                {...props.TextFieldProps.InputProps}
            ),
            readOnly: true,
            endAdornment:(
                <InputAdornment position={"end"}>
                    {props.ButtonFile}
                </InputAdornment>
            )
        },
        value: fileName
    };

    const inputFileProps = {
        ...props.InputFileProps,
        onChange(event: any) {
            const files = event.target.files;
            if(files.length) {
                setFileName(Array.from(files).map((file:any) => file.name).join(','));
            }
            if(props.InputFileProps && props.InputFileProps.onChange) {
                props.InputFileProps.onChange(event);
            }
        },
        hidden: true,
        ref: fileRef
    }

    return (
        <>
            <input type="file" {...inputFileProps} />
            <TextField {...textFieldProps}/>
        </>
    )
});

export default InputFile;