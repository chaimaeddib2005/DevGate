import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import AddCompetence from '@/components/AddCompetence.vue';
import AddObjectif from '@/components/AddObjectif.vue';
import AddProject from '@/components/AddProject.vue';
import CompetencesView from '@/components/CompetencesPage.vue';
import ObjectifsView from '@/components/ObjectifsPage.vue';
import ProjectsView from '@/components/ProjectsPage.vue';
import DiscoverView from '@/components/DiscoverView.vue';
import EditProfile from '@/components/ProfilePage.vue';
import LoginPage from '@/components/LoginPage.vue';
import FolowersView from '@/components/FolowersView.vue';
import FolowingsView from '@/components/FolowingsView.vue';
import RegisterPage from '@/components/RegisterPage.vue';
import TimeLine from '@/components/TimeLine.vue';
import Visualization from '@/components/VisualisationView.vue';

const routes = [
  { 
    path: '/', 
    component: LoginPage
  },
  {
    path:'/visualize/:userId',
    component: Visualization
  },
  {
    path: '/home/:userId',
    component: HomePage,
  },
  {
    path: '/timeline/:userId',
    component: TimeLine,
  },
  {
    path: '/Competences/:userId',
    component: CompetencesView,
 
  },
  {
    path:'/AddCompetence',
    component: AddCompetence
  },
  {
    path: '/objectifs/:userId',
    component: ObjectifsView,
  
  },
  
    {
      path: '/AddObjectif', // Full path: /objectifs/add
      component: AddObjectif
    }
  ,
  {
    path: '/projects/:userId',
    component: ProjectsView,
   
  },
  {
    path: '/AddProject', // Full path: /projects/add
    component: AddProject
  },
  {
    path: '/discover',
    component: DiscoverView,
  },
  {
    path: '/edit-profile',
    component:EditProfile,
  },
  {
    path:'/followings/:userId',
    component: FolowingsView,

  },
  {
    path:'/followers/:userId',
    component: FolowersView,
  },
  {
    path: '/login',
    component: LoginPage,
  }
 ,
 {
  path: '/register',
  component: RegisterPage,
 }

  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;