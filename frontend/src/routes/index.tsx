import {RouteProps} from 'react-router-dom'
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/category/PageList';
import PageFormCategory from '../pages/category/PageForm';
import GenreList from '../pages/genre/PageList';
import PageFormGenre from '../pages/genre/PageForm';
import CastMemberList from '../pages/cast-member/PageList';
import PageFormCastMember from '../pages/cast-member/PageForm';
import VideoList from '../pages/video/PageList';
import PageFormVideo from '../pages/video/PageForm';
import UploadPage from '../pages/uploads';

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
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
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
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: PageFormGenre,
        exact: true
    },
    {
        name: 'cast_members.list',
        label: 'Listar membros do elenco',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: 'Criar membro do elenco',
        path: '/cast-members/create',
        component: PageFormCastMember,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar membro do elenco',
        path: '/cast-members/:id/edit',
        component: PageFormCastMember,
        exact: true
    },
    {
        name: 'videos.list',
        label: 'Listar videos',
        path: '/videos',
        component: VideoList,
        exact: true
    },
    {
        name: 'videos.create',
        label: 'Criar video',
        path: '/videos/create',
        component: PageFormVideo,
        exact: true
    },
    {
        name: 'videos.edit',
        label: 'Editar video',
        path: '/videos/:id/edit',
        component: PageFormVideo,
        exact: true
    },
    {
        name: 'uploads',
        label: 'Upload',
        path: '/uploads',
        component: UploadPage,
        exact: true
    }
];

export default routes;