<template>
    <div>
        <button>
          <router-link to="/objectifs/add">Add Objectif</router-link>
        </button>
        <div v-if="documentIds.length">
          <div v-for="id in documentIds" :key="id">
            <objectifView :objectifId="id" />
          </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
import {db } from '@/firebase';
  import {collection,getDoc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import ObjectifView from './ObjectifView.vue';

export default {
  components: {
    ObjectifView,
  },
  data() {
    return {
      documentIds: [],  // Holds Objectif Document IDs
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
        const objectifs = userDoc.data().objectifs || []; // Fetch Objectif IDs from user document
        return objectifs;
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
  },
};
</script>
