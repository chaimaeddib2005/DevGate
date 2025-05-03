<template>
  <div class="cyber-discover-container">
    <div class="cyber-controls">
      <router-link :to="`/home/${auth.currentUser.uid}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    </div>
    <h1 class="cyber-discover-title">Discover new developpers</h1>

    <div class="cyber-user-grid">
      <div v-for="user in users" :key="user.id" class="cyber-user-card">
        <div class="cyber-user-image-wrapper">
          <img @click="GoToprofile(user.id)"
            :src="user.photoURL || defaultPhoto"
            alt="photo de profil"
            class="cyber-user-image"
          />
        </div>
        <h2 class="cyber-user-name">{{ user.name }}</h2>
        <button @click="connectUser(user.id)" class="cyber-connect-btn">
          <i class="fas fa-user-plus cyber-btn-icon"></i>
          <span class="cyber-btn-text">Follow</span>
        </button>
      </div>
    </div>
    <div v-if="users.length === 0" class="cyber-no-users-message">
      No developers found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import {useRouter} from 'vue-router'
const router = useRouter();
const auth = getAuth();
const users = ref([]);
const defaultPhoto = 'https://via.placeholder.com/150'; // Default image if no photoURL

// Load users
onMounted(async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const querySnapshot = await getDocs(collection(db, 'users'));

  users.value = querySnapshot.docs
    .filter(doc => doc.id !== currentUser?.uid)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

 
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});
async function GoToprofile(Id){
  router.push('/home/'+Id);

}

// Function to connect to a user
async function connectUser(otherUserId) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser && currentUser.uid !== otherUserId) {
    const currentUserRef = doc(db, 'users', currentUser.uid);

    await updateDoc(currentUserRef, {
      followings: arrayUnion(otherUserId),
    });

    alert('Connecté avec succès 🎉');
  } else {
    alert('Erreur : vous ne pouvez pas vous connecter à vous-même.');
  }
}
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Discover Developers */
.cyber-discover-container {
  padding: 2rem;
  background: rgba(10, 10, 20);
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

.cyber-discover-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-user-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.cyber-user-card {
  background: rgba(20, 20, 30, 0.6);
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.cyber-user-card:hover {
  transform: translateY(-5px);
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

.cyber-connect-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 0;
  background-color: rgba(0, 102, 255, 0.2);
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
}

.cyber-connect-btn:hover {
  background-color: rgba(0, 102, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.4);
  transform: translateY(-2px);
}

.cyber-connect-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.4), transparent);
  transition: 0.5s;
}

.cyber-connect-btn:hover::before {
  left: 100%;
}

.cyber-btn-icon {
  font-size: 1.2rem;
}

.cyber-btn-text {
  position: relative;
}

.cyber-no-users-message {
  color: #eee;
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-discover-container {
    padding: 1.5rem;
  }

  .cyber-user-grid {
    grid-template-columns: 1fr;
  }

  .cyber-user-card {
    padding: 1.5rem;
  }

  .cyber-connect-btn {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
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