<template>
    <div>
        <button>
          <router-link to="/AddProject">Add Project</router-link>
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
  import {doc,getDoc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
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
    this.getAllDocumentIds().then(ids => {
      this.projectIds = ids;
    });
  },
  methods: {
    async getAllDocumentIds() {
      const user = getAuth().currentUser;
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const projects = userDoc.data().projects || []; // Fetch Project IDs from user document
        return projects;
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
  },
};
</script>
