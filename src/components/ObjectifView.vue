<template>
    <div v-if="objectifId">
      <div v-if="!editmode" class="objectif-card">
        <button @click="deleteObjectif(objectifId)">
         Delete
        </button>
        <button @click="editmode = !editmode">
         Edit
        </button>
        <p>{{ objectif.name }}</p>
        <p>Status: <span>{{ objectif.status }}</span></p>
        
  
        <p>Progress:</p>
        <div
          id="progress-bar"
          :style="{ width: objectif.progress + '%', height: '20px', background: '#4caf50' }"
        ></div>
        <p id="progress-text">{{ objectif.progress }}%</p>
  
        <p v-if="objectif.created">Created: {{ formatDate(objectif.created) }}</p>
      </div>
  
      <div v-if="editmode">
        <label>Name:</label>
        <input type="text" v-model="objectif.name" @keyup.enter="updateObjectif" />
        <label>Status:</label>  
        <input type="text" v-model="objectif.status" @keyup.enter="updateObjectif" />
        <label>Progress:</label>
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
    serverTimestamp,
    arrayRemove,
    arrayUnion} from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';
  
  
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
            body: this.objectif.name,
            status: this.objectif.status,
            progress: this.objectif.progress,
          });
  
          const upodateRef = await addDoc(collection(db, 'timeline'), {
            ItemId: this.objectifId,
            ItemType: 'objectif',
            Message: 'New modifications on the objectif ' + this.objectif.body,
            timestamp: serverTimestamp(),
            type: 'update',
          });
          const user = getAuth().currentUser;
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            timeline: arrayUnion(upodateRef.id),
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
          const user = getAuth().currentUser;
          const userRef = doc(db, 'users', user.uid);
         
          const midfRef = await addDoc(collection(db, 'timeline'), {
            ItemId: objectifId,
            ItemType: 'objectif',
            Message: 'Deleted objectif: ' + this.objectif.name,
            timestamp: serverTimestamp(),
            type: 'delete',
          });
          await updateDoc(userRef, {
            objectifs: arrayRemove(objectifId),
            timeline: arrayUnion(midfRef.id),
          });

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
  