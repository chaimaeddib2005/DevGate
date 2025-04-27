<template>
    <div>
        <button>
          <router-link to="/projects/add">Add Project</router-link>
        </button>
      <!-- For Projects -->
      <div v-if="projectIds.length">
        <div v-for="id in projectIds" :key="id">
          <projectView :projectId="id" />
        </div>
      </div>
    </div>
    <router-view></router-view>
</template>

<script>
import {db } from '@/firebase';
  import {collection,getDocs} from 'firebase/firestore'
import ProjectView from './ProjectView.vue';

export default {
  components: {
    ProjectView,
  },
  data() {
    return {
      projectIds: [],  // Holds Project Document IDs
    };
  },
  mounted() {
    this.getAllDocumentIds('projects').then(ids => {
      this.projectIds = ids;
    });
  },
  methods: {
    async getAllDocumentIds(collectionName) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const ids = querySnapshot.docs.map(doc => doc.id);
        console.log(`${collectionName} Document IDs:`, ids);
        return ids;
      } catch (error) {
        console.error(`Error fetching document IDs from ${collectionName}:`, error);
        return [];
      }
    },
  },
};
</script>
