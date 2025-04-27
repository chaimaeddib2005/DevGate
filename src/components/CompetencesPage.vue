<template>
    <div>
      <button>
        <router-link to="/competences/add">Add Competence</router-link>
      </button>
      
      <div v-if="documentIds.length">
        <div v-for="id in documentIds" :key="id">
          <CompetenceView :competenceId="id" />
        </div>
      </div>
  
      <!-- Make sure you have a router-view for nested routes -->
      <router-view></router-view>  <!-- This will render the AddCompetence page -->
    </div>
  </template>
  
  <script>
  import { db } from '@/firebase';
  import { collection, getDocs } from 'firebase/firestore';
  import CompetenceView from './CompetenceView.vue';
  
  export default {
    components: {
      CompetenceView,
    },
    data() {
      return {
        documentIds: [],
      };
    },
    mounted() {
      this.getAllDocumentIds().then(ids => {
        this.documentIds = ids;
      });
    },
    methods: {
      async getAllDocumentIds() {
        try {
          const querySnapshot = await getDocs(collection(db, 'competences'));
          const ids = querySnapshot.docs.map(doc => doc.id);
          console.log('Document IDs:', ids);
          return ids;
        } catch (error) {
          console.error('Error fetching document IDs:', error);
          return [];
        }
      },
    },
  };
  </script>
  