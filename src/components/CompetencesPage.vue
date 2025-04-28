<template>
  <div class="competence-container">
    <button class="add-button">
      <router-link to="/AddCompetence" class="add-link">Add Competence</router-link>
    </button>
    
    <div v-if="documentIds.length" class="competence-list">
      <div v-for="id in documentIds" :key="id" class="competence-item">
        <CompetenceView :competenceId="id" />
      </div>
    </div>

    <!-- Make sure you have a router-view for nested routes -->
    <router-view></router-view>
  </div>
</template>

<script>
/* Script remains exactly the same */
import { db } from '@/firebase';
import {getDoc,doc } from 'firebase/firestore';
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
      console.log(user);
      try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const competences = userDoc.data().compétences || [];
          return competences;
          
          } catch (error) {
              console.error('Error fetching document IDs:', error);
              return [];
          }
      },
  },
};
</script>

<style scoped>
.competence-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.add-button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #45a049;
}

.add-link {
  color: white;
  text-decoration: none;
}

.competence-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.competence-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.competence-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>