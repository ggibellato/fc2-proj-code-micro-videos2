import {RouteProps} from 'react-router-dom'
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/category/PageList';
import PageFormCategory from '../pages/category/PageForm';
import GenreList from '../pages/genre/PageList';
import PageFormGenre from '../pages/genre/PageForm';
import CastMemberList from '../pages/castmember/PageList';
import PageFormCastMember from '../pages/castmember/PageForm';

export interface MyRouteProps extends RouteProps {
    name: string;
    label : string;    
}

const routes: MyRouteProps[] =  [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        component: PageFormCategory,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'Listar gêneros',
        path: '/genres',
        component: GenreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar gênero',
        path: '/genres/create',
        component: PageFormGenre,
        exact: true
    },
    {
        name: 'castmembers.list',
        label: 'Listar membros do elenco',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'castmembers.create',
        label: 'Criar membro do elenco',
        path: '/castmembers/create',
        component: PageFormCastMember,
        exact: true
    }
];

export default routes;