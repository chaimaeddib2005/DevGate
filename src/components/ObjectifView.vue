<template>
    <div v-if="objectifId">
      <div v-if="!editmode" class="objectif-card">
        <button @click="deleteObjectif(objectifId)">
          <i data-eva="trash-2-outline"></i>
        </button>
        <button @click="editmode = !editmode">
          <i data-eva="edit-outline"></i>
        </button>
        <p>{{ objectif.body }}</p>
        <p>Status: <span>{{ objectif.status }}</span></p>
        <button v-if="objectif.status === 'completed'">Mark as uncompleted</button>
        <button v-if="objectif.status === 'in progress'">Mark as completed</button>
  
        <p>Progress:</p>
        <div
          id="progress-bar"
          :style="{ width: objectif.progress + '%', height: '20px', background: '#4caf50' }"
        ></div>
        <p id="progress-text">{{ objectif.progress }}%</p>
  
        <p v-if="objectif.created">Created: {{ formatDate(objectif.created) }}</p>
      </div>
  
      <div v-if="editmode">
        <input type="text" v-model="objectif.body" @keyup.enter="updateObjectif" />
        <input type="text" v-model="objectif.status" @keyup.enter="updateObjectif" />
        <input type="number" v-model="objectif.progress" @keyup.enter="updateObjectif" min="0" max="100" />
        <button @click="updateObjectif">Save</button>
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
      objectifId: {
        type: String,
        required: true,
      },
    },
  
    data() {
      return {
        objectif: {},
        editmode: false,
      };
    },
  
    mounted() {
      if (this.objectifId) {
        this.fetchObjectif();
      }
    },
  
    methods: {
      async fetchObjectif() {
        try {
          const docRef = doc(db, 'objectifs', this.objectifId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            this.objectif = docSnap.data();
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching document:', error);
        }
      },
  
      async updateObjectif() {
        try {
          const docRef = doc(db, 'objectifs', this.objectifId);
          await updateDoc(docRef, {
            body: this.objectif.body,
            status: this.objectif.status,
            progress: this.objectif.progress,
          });
  
          await addDoc(collection(db, 'timeline'), {
            ItemId: this.objectifId,
            ItemType: 'objectif',
            Message: 'New modifications on the objectif ' + this.objectif.body,
            timestamp: serverTimestamp(),
            type: 'update',
          });
  
          this.editmode = false;
          console.log('Objectif updated and timeline entry added.');
        } catch (error) {
          console.error('Error updating or logging modification:', error);
        }
      },
  
      async deleteObjectif(objectifId) {
        try {
          const docRef = doc(db, 'objectifs', objectifId);
          await deleteDoc(docRef);
          console.log('Document successfully deleted!');
        } catch (error) {
          console.error('Error removing document:', error);
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
  