import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';
import Table from './Table';

const PageList = () => {
    return (
        <Page title="Listagem de membros do elenco">
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title="Adicionar membro do elenco"
                    color={'secondary'}
                    size="small"
                    component={Link}
                    to="/cast-members/create"
                >
                    <AddIcon/>
                </Fab>                
            </Box>
            <Box>
                <Table />
            </Box>
        </Page>
    );
};

export default PageList;