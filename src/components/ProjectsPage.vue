<template>
  <div class="cyber-projects-container">
    <div class="cyber-controls">
      <router-link :to="`/home/${userId}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> Back
      </router-link>
      <router-link to="/AddProject" class="cyber-add-btn" v-if="isOwner">
        <i class="fas fa-plus-circle cyber-btn-icon"></i>
        <span class="cyber-btn-text">Add Project</span>
      </router-link>
      <div class="cyber-view-selector">
        <label for="viewType" class="cyber-label">View:</label>
        <select v-model="viewType" id="viewType" class="cyber-select">
          <option value="list">List</option>
          <option value="gallery">Gallery</option>
        </select>
      </div>
    </div>

    <div v-if="projectIds.length" :class="['cyber-project-list', `cyber-view-${viewType}`]">
      <div v-for="id in projectIds" :key="id" class="cyber-card-container">
        <projectView 
          :projectId="id" 
          :isOwner="isOwner"
          @deleted="handleProjectDeleted"
        />
      </div>
    </div>

    <router-view class="cyber-router-view"></router-view>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ProjectView from './ProjectView.vue';
import { useRoute } from 'vue-router'

export default {
  components: {
    ProjectView,
  },
  data() {
    return {
      projectIds: [],
      viewType: 'list',
      userId: "",
      isOwner: false,
      route: useRoute()
    };
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    async loadProjects() {
      const ids = await this.getAllDocumentIds();
      this.projectIds = ids;
    },
    
    async getAllDocumentIds() {
      const Cuuser = getAuth().currentUser;
      const userId = this.route.params.userId;
      this.userId = userId;
      this.isOwner = Cuuser && Cuuser.uid === userId;
      
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        return userDoc.data().projects || [];
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
    
    handleProjectDeleted(deletedId) {
      // Remove the deleted project from the local array
      this.projectIds = this.projectIds.filter(id => id !== deletedId);
      
      // Optional: Show success notification
      console.log(`Project ${deletedId} removed successfully`);
      
      // If using a notification system:
      // this.$notify({ type: 'success', message: 'Project deleted' });
    }
  }
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Projects */
.cyber-projects-container {
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  background: rgba(10, 10, 20);
}

.cyber-controls {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s;
  border-radius: 0;
  background: rgba(50, 50, 50, 0.7);
  color: #eee;
  border: 2px solid #777;
  margin-right: 1rem;
}

.back-btn:hover {
  background: rgba(70, 70, 70, 0.9);
  text-shadow: none;
  animation: none;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.cyber-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(0, 102, 255, 0.15);
  color: #00a2ff;
  border: 2px solid #0066ff;
  padding: 0.8rem 1.8rem;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border-radius: 0;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.cyber-add-btn:hover {
  background: rgba(0, 102, 255, 0.3);
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
  transform: translateY(-2px);
}

.cyber-add-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.4), transparent);
  transition: 0.5s;
}

.cyber-add-btn:hover::before {
  left: 100%;
}

.cyber-btn-icon {
  font-size: 1.2rem;
}

.cyber-btn-text {
  position: relative;
}

.cyber-view-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cyber-label {
  color: #eee;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 102, 255, 0.5);
}

.cyber-select {
  padding: 0.6rem 1rem;
  border: 1px solid #0066ff;
  border-radius: 0;
  background-color: rgba(20, 20, 30, 0.8);
  color: #fff;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.cyber-select:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.cyber-project-list {
  margin-top: 1.5rem;
}

/* List View */
.cyber-view-list .cyber-card-container {
  background: rgba(20, 20, 30, 0.7);
  margin-bottom: 2rem;
  position: relative;
  transition: all 0.4s ease;
  overflow: hidden;
}

.cyber-view-list .cyber-card-container:hover {
  border-color: #00a2ff;
}

.cyber-view-list .cyber-card-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 45%, rgba(0, 102, 255, 0.1) 50%, transparent 55%);
  background-size: 5px 5px;
  opacity: 0.6;
  z-index: 1;
}

/* Gallery View */
.cyber-view-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, auto));
  gap: 2rem;
}

.cyber-view-gallery .cyber-card-container {
  background: rgba(20, 20, 30, 0.7);
  position: relative;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
}

.cyber-router-view {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 102, 255, 0.2);
}

@media (max-width: 768px) {
  .cyber-projects-container {
    padding: 1.5rem;
  }

  .cyber-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .cyber-add-btn {
    width: 100%;
    justify-content: center;
  }

  .cyber-view-gallery {
    grid-template-columns: 1fr;
  }
}
</style>