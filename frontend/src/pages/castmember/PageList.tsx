import { Box } from '@material-ui/core';
import { Page } from '../../components/Page';
import Table from './Table';

const PageList = () => {
    return (
        <Page title="Listagem de membros do elenco">
            <Box>
                <Table />
            </Box>
        </Page>
    );
};

export default PageList;