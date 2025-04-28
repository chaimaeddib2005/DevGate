<template>
    <div v-if="competenceId">
      <div v-if="!editmode" class="competence-card">
        <button @click="deleteCompetence(competenceId)">
          Delete
        </button>
        <button @click="editmode = !editmode">
         Modify
        </button>
  
        <p>{{ competence.name }}</p>
        <p>Level: <span>{{ competence.level }}</span></p>
  
        <p v-if="competence.created">Aquization: {{ formatDate(competence.created) }}</p>
      </div>
  
      <div v-if="editmode">
        <label>Name:</label>
        <input type="text" v-model="competence.name" @keyup.enter="updateCompetence" />
        <label>Level:</label>
        <select v-model="competence.level" @change="updateCompetence">
          <option value="begginer">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
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
    serverTimestamp,
    arrayRemove,
    arrayUnion} from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
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
          const docRef = doc(db, 'compétences', this.competenceId);
          await updateDoc(docRef, {
            name: this.competence.name,
            level: this.competence.level,
          });
  
          const timeref = await addDoc(collection(db, 'timeline'), {
            ItemId: this.competenceId,
            ItemType: 'compétence',
            Message: 'Updated competence: ' + this.competence.body,
            timestamp: serverTimestamp(),
            type: 'update',
          });
          const currentUser = getAuth().currentUser;
          const userRef = doc(db, 'users', currentUser.uid);
          updateDoc(userRef, {
            timeline: arrayUnion(timeref.id),
          });
  
          this.editmode = false;
          console.log('Competence updated and timeline entry added.');
        } catch (error) {
          console.error('Error updating or logging modification:', error);
        }
      },
  
      async deleteCompetence(competenceId) {
        try {
          const docRef = doc(db, 'compétences', competenceId);
          await deleteDoc(docRef);
          console.log('Competence successfully deleted!');
        } catch (error) {
          console.error('Error deleting competence:', error);
        }
        const currentUser = getAuth().currentUser;
        const userRef = doc(db, 'users', currentUser.uid);
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: competenceId,
          ItemType: 'competence',
          Message: 'Deleted competence: ' + this.competence.body,
          timestamp: serverTimestamp(),
          type: 'delete',
        });
        await updateDoc(userRef, {
          compétences: arrayRemove(competenceId),
          timeline: arrayUnion(timeref.id),
        });
      },
  
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  };
  </script>
  