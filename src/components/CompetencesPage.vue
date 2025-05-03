<template>
  <div class="competence-list-container">
    <router-link :to="`/home/${userId}`" class="btn back-btn">
      <i class="fas fa-arrow-left"></i> Back
    </router-link>

    <router-link to="/AddCompetence" class="btn add-competence-btn" v-if="isOwner">
      <i class="fas fa-plus"></i> Add Competence
    </router-link>

    <div v-if="documentIds.length" class="competence-grid">
      <div v-for="id in documentIds" :key="id" class="competence-card-wrapper">
        <CompetenceView :competenceId="id" :isOwner="isOwner" @deleted="handleCompetenceDeleted"/>
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
/* Script remains exactly the same */
import { db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';
import CompetenceView from './CompetenceView.vue';
import { getAuth } from 'firebase/auth';
import { useRoute } from 'vue-router'

export default {
  components: {
    CompetenceView,
  },
  data() {
    return {
      isOwner: false,
      documentIds: [],
      route: useRoute(),
      userId: ""
    }
  },
  mounted() {
    this.getAllDocumentIds().then((ids) => {
      this.documentIds = ids
    });
    window.scrollTo({
    top: 0,
    behavior: 'smooth' // optional: smooth scroll
  });
  },
  methods: {
    handleCompetenceDeleted(deletedId) {
 
    this.documentIds = this.documentIds.filter(c => c !== deletedId);

  },
    async getAllDocumentIds() {
      const Cuuser = getAuth().currentUser;
      const userId = this.route.params.userId;
      this.userId = userId;
      this.isOwner = Cuuser && Cuuser.uid === userId;
      console.log(this.isOwner)
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const competences = userDoc.data().compétences || [];
        return competences;
      } catch (error) {
        console.error('Error fetching document IDs:', error);
        return [];
      }
    },
  },
};

</script>

<style scoped>
/* Cyber/Developer Theme Styles */
.competence-list-container {
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  background: rgba(10, 10, 20);
  height: 999px;
}

.back-btn,
.add-competence-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  border-radius: 0;
}

.back-btn {
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

.add-competence-btn {
  background: rgba(0, 102, 255, 0.2);
  color: #1692d9;
  border: 2px solid #0066ff;
}

.add-competence-btn:hover {
  background: rgba(0, 102, 255, 0.3);
  transform: translateY(-2px);
}

.competence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.competence-card-wrapper {
  background: rgba(20, 20, 30, 0.7);
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.competence-card-wrapper:hover {
  transform: translateY(-5px);
}

.competence-card-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 48%, rgba(0, 102, 255, 0.1) 50%, transparent 52%);
  background-size: 5px 5px;
  opacity: 0.5;
}

/* Glitch animation */
@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@media (max-width: 768px) {
  .competence-grid {
    grid-template-columns: 1fr;
  }

  .competence-list-container {
    padding: 1rem;
  }

  .back-btn,
  .add-competence-btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
    justify-content: center;
  }
}
</style>