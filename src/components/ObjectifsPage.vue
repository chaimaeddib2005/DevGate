<template>
  <div class="cyber-objectifs-container">
    <div class="cyber-controls">
      <router-link to="/home" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
      <router-link to="/AddObjectif" class="cyber-add-btn">
        <i class="fas fa-plus-circle cyber-btn-icon"></i>
        <span class="cyber-btn-text">Add Objectif</span>
      </router-link>
    </div>
    <div v-if="documentIds.length" class="cyber-objectif-list">
      <div v-for="id in documentIds" :key="id" class="cyber-objectif-card-wrapper">
        <objectifView :objectifId="id" />
      </div>
    </div>
    <div v-else class="cyber-empty-message">
      No objectifs have been added yet. Click "Add Objectif" to create one.
    </div>
    <router-view class="cyber-router-view"></router-view>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ObjectifView from './ObjectifView.vue';

export default {
  components: {
    ObjectifView,
  },
  data() {
    return {
      documentIds: [], // Holds Objectif Document IDs
    };
  },
  mounted() {
    this.getAllDocumentIds().then((ids) => {
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
        console.log('Objectif IDs:', objectifs); // Log the fetched IDs
        return objectifs;
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
  },
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Objectifs List */
.cyber-objectifs-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(10, 10, 20, 0.7);
  border: 1px solid rgba(0, 102, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.1);
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
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.4);
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

.cyber-objectif-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cyber-objectif-card-wrapper {
  /* Styles for wrapping the individual objectif cards if needed */
}

.cyber-empty-message {
  color: #aaa;
  font-style: italic;
  margin-top: 2rem;
  text-align: center;
}

.cyber-router-view {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 102, 255, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-objectifs-container {
    padding: 1.5rem;
  }

  .cyber-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .back-btn,
  .cyber-add-btn {
    width: 100%;
    justify-content: center;
  }

  .cyber-objectif-list {
    margin-top: 1.5rem;
    gap: 1rem;
  }
}
</style>