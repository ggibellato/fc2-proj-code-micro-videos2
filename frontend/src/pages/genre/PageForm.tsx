import { Page } from '../../components/Page'
import {useParams} from 'react-router';
import Form from './Form'

export default function PageForm() {
    const {id} = useParams<any>();
    return (
        <Page title = {!id ? 'Criar gênero' : 'Editar gênero'}>
            <Form/>
        </Page>
    )
}
