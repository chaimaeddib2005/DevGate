<template>
    <div class="add-objectif">
      <h2>Add New Objectif</h2>
      <form @submit.prevent="addObjectif">
        <div>
          <label for="body">Objectif Body</label>
          <textarea v-model="objectif.body" id="body" required></textarea>
        </div>
        <div>
          <label for="status">Status</label>
          <select v-model="objectif.status" id="status" required>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label for="progress">Progress (%)</label>
          <input type="number" v-model="objectif.progress" id="progress" min="0" max="100" required />
        </div>
        <button type="submit">Save Objectif</button>
      </form>
    </div>
  </template>
  
  <script>
 import {db } from '@/firebase';
  import {collection,addDoc,serverTimestamp,arrayUnion,updateDoc} from 'firebase/firestore'
  import { getAuth } from 'firebase/auth';

  
  export default {
    data() {
      return {
        objectif: {
          body: '',
          status: 'in progress',
          progress: 0,
          created: serverTimestamp(),
        },
      };
    },
    methods: {
      async addObjectif() {
        try {
          const objectifRef = await addDoc(collection(db, 'objectifs'), this.objectif);
          console.log('Objectif added with ID: ', objectifRef.id);
          await addDoc(collection(db, 'timeline'), {
            ItemId: objectifRef.id,
            ItemType: 'objectif',
            Message: 'New objectif is added: ' + this.objectif.body,
            timestamp: serverTimestamp(),
            type: 'add',
          });
          const user = getAuth().currentUser;
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            objectifs: arrayUnion(objectifRef.id),
          });
          this.$router.push({ name: 'ObjectifsPage' }); // Redirect to objectif list or details page
        } catch (error) {
          console.error('Error adding objectif: ', error);
        }
       

      },
      
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  