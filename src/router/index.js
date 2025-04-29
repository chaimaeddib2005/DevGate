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
    path:'/visualize',
    component: Visualization
  },
  {
    path: '/home',
    component: HomePage,
  },
  {
    path: '/timeline',
    component: TimeLine,
  },
  {
    path: '/Competences',
    component: CompetencesView,
 
  },
  {
    path:'/AddCompetence',
    component: AddCompetence
  },
  {
    path: '/objectifs',
    component: ObjectifsView,
  
  },
  
    {
      path: '/AddObjectif', // Full path: /objectifs/add
      component: AddObjectif
    }
  ,
  {
    path: '/projects',
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
    path:'/followings',
    component: FolowingsView,

  },
  {
    path:'/followers',
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