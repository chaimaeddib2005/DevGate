<template>
    <div class="add-competence">
      <h2>Add New Competence</h2>
      <form @submit.prevent="addCompetence">
        <div>
          <label for="body">Competence Body</label>
          <textarea v-model="competence.body" id="body" required></textarea>
        </div>
        <div>
          <label for="level">Level</label>
          <select v-model="competence.level" id="level" required>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label for="progress">Progress (%)</label>
          <input type="number" v-model="competence.progress" id="progress" min="0" max="100" required />
        </div>
        <button type="submit">Save Competence</button>
      </form>
    </div>
  </template>
  
  <script>
  import {db } from '@/firebase';
  import {collection,addDoc,serverTimestamp,updateDoc,arrayUnion} from 'firebase/firestore'
  import { getAuth } from 'firebase/auth';
  
  
  export default {
    data() {
      return {
        competence: {
          body: '',
          level: 'beginner',
          progress: 0,
          aquization: serverTimestamp(),
          created: serverTimestamp(),
        },
      };
    },
    methods: {
      async addCompetence() {
        try {
          const competenceRef = await addDoc(collection(db, 'competences'), this.competence);
          console.log('Competence added with ID: ', competenceRef.id);
          await addDoc(collection(db, 'timeline'), {
            ItemId: competenceRef.id,
            ItemType: 'competence',
            Message: 'New competence is added: ' + this.competence.body,
            timestamp: serverTimestamp(),
            type: 'add',
          });
          const user = getAuth().currentUser;
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            competences: arrayUnion(competenceRef.id),
          });
          this.$router.push({ name: '/Competences' }); // Redirect to competence list or details page
        } catch (error) {
          console.error('Error adding competence: ', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  