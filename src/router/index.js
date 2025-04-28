import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import AddCompetence from '@/components/AddCompetence.vue';
import AddObjectif from '@/components/AddObjectif.vue';
import AddProject from '@/components/AddProject.vue';
import CompetencesView from '@/components/CompetencesPage.vue';
import ObjectifsView from '@/components/ObjectifsPage.vue';
import ProjectsView from '@/components/ProjectsPage.vue';

const routes = [
  { 
    path: '/', 
    component: HomePage 
  },
  {
    path: '/Competences',
    component: CompetencesView,
 
  },
  {
    path:'/AddComepetence',
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;