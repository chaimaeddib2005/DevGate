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
  import {getDoc } from 'firebase/firestore';
  import CompetenceView from './CompetenceView.vue';
  import { getAuth } from 'firebase/auth';
  
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
        const user = getAuth().currentUser;
      
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const competences = userDoc.data().competences || [];
          return competences;
          
        } catch (error) {
          console.error('Error fetching document IDs:', error);
          return [];
        }
      },
    },
  };
  </script>
  