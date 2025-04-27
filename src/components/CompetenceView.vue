<template>
    <div v-if="competenceId">
      <div v-if="!editmode" class="competence-card">
        <button @click="deleteCompetence(competenceId)">
          <i data-eva="trash-2-outline"></i>
        </button>
        <button @click="editmode = !editmode">
          <i data-eva="edit-outline"></i>
        </button>
  
        <p>{{ competence.body }}</p>
        <p>Level: <span>{{ competence.level }}</span></p>
  
        <p>Progress:</p>
        <div
          id="progress-bar"
          :style="{ width: competence.progress + '%', height: '20px', background: '#4caf50' }"
        ></div>
        <p id="progress-text">{{ competence.progress }}%</p>
  
        <p v-if="competence.aquization">Aquization: {{ formatDate(competence.aquization) }}</p>
        <p v-if="competence.created">Created: {{ formatDate(competence.created) }}</p>
      </div>
  
      <div v-if="editmode">
        <input type="text" v-model="competence.body" @keyup.enter="updateCompetence" />
        <select v-model="competence.level" @change="updateCompetence">
          <option value="begginer">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input
          type="number"
          v-model="competence.progress"
          @keyup.enter="updateCompetence"
          min="0"
          max="100"
        />
        <button @click="updateCompetence">Save</button>
        <button @click="editmode = false">Cancel</button>
      </div>
    </div>
  </template>
  
  <script>
  import {
    db
  
  } from '@/firebase';
  
 import {  doc,
    getDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    collection,
    serverTimestamp,} from 'firebase/firestore';
  
  export default {
    props: {
      competenceId: {
        type: String,
        required: true,
      },
    },
  
    data() {
      return {
        competence: {},
        editmode: false,
      };
    },
  
    mounted() {
      if (this.competenceId) {
        this.fetchCompetence();
      }
    },
  
    methods: {
      async fetchCompetence() {
        try {
          const docRef = doc(db, 'competences', this.competenceId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            this.competence = docSnap.data();
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching competence:', error);
        }
      },
  
      async updateCompetence() {
        try {
          const docRef = doc(db, 'competences', this.competenceId);
          await updateDoc(docRef, {
            body: this.competence.body,
            level: this.competence.level,
            progress: this.competence.progress,
          });
  
          await addDoc(collection(db, 'timeline'), {
            ItemId: this.competenceId,
            ItemType: 'competence',
            Message: 'Updated competence: ' + this.competence.body,
            timestamp: serverTimestamp(),
            type: 'update',
          });
  
          this.editmode = false;
          console.log('Competence updated and timeline entry added.');
        } catch (error) {
          console.error('Error updating or logging modification:', error);
        }
      },
  
      async deleteCompetence(competenceId) {
        try {
          const docRef = doc(db, 'competences', competenceId);
          await deleteDoc(docRef);
          console.log('Competence successfully deleted!');
        } catch (error) {
          console.error('Error deleting competence:', error);
        }
      },
  
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  };
  </script>
  