<template>
  <div class="cyber-followings-container">
    <div class="cyber-controls">
      <router-link to="/home" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    </div>
    <h1 class="cyber-followings-title">Mes Followings</h1>

    <div v-if="loading" class="cyber-loading-message">Chargement...</div>

    <div v-else-if="followingUsers.length === 0" class="cyber-no-followings-message">
      <p>Vous ne suivez personne.</p>
    </div>

    <div v-else class="cyber-user-grid">
      <div v-for="user in followingUsers" :key="user.id" class="cyber-user-card">
        <div class="cyber-user-image-wrapper">
          <img
            :src="user.photoURL || defaultImage"
            alt="Photo de profil"
            class="cyber-user-image"
          />
        </div>
        <h2 class="cyber-user-name">{{ user.name }}</h2>
        <p class="cyber-user-email">{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';

const followingUsers = ref([]);
const loading = ref(true);
const defaultImage = 'https://via.placeholder.com/150';

onMounted(async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const followings = userSnap.data().followings || [];

      if (followings.length > 0) {
        const promises = followings.map(uid => getDoc(doc(db, 'users', uid)));
        const results = await Promise.all(promises);

        followingUsers.value = results
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));
      }
    }
  }

  loading.value = false;
});
</script>

<style scoped>
/* Cyber/Developer Theme Styles for My Followings */
.cyber-followings-container {
  padding: 2rem;
  background: rgba(10, 10, 20, 0.7);
  border: 1px solid rgba(0, 102, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.1);
  min-height: 100vh;
}

.cyber-controls {
  display: flex;
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

.cyber-followings-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-loading-message {
  color: #eee;
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
}

.cyber-no-followings-message {
  color: #eee;
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
}


.cyber-user-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.cyber-user-card {
  background: rgba(20, 20, 30, 0.9);
  padding: 2rem;
  border: 1px solid #0066ff;
  border-radius: 0;
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.cyber-user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(0, 102, 255, 0.5);
}

.cyber-user-image-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
}

.cyber-user-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cyber-user-name {
  color: #eee;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.cyber-user-email {
  color: #aaa;
  font-size: 0.9rem;
  font-family: 'Roboto Mono', monospace;
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-followings-container {
    padding: 1.5rem;
  }

  .cyber-user-grid {
    grid-template-columns: 1fr;
  }

  .cyber-user-card {
    padding: 1.5rem;
  }
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .cyber-user-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop styles */
@media (min-width: 1025px) {
  .cyber-user-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>