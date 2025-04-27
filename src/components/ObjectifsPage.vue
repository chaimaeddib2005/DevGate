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
  import {collection,getDocs} from 'firebase/firestore'
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
      try {
        const querySnapshot = await getDocs(collection(db, 'objectifs'));
        const ids = querySnapshot.docs.map(doc => doc.id);
        console.log('Objectif Document IDs:', ids);
        return ids;
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
  },
};
</script>
