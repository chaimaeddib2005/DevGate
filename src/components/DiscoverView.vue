<template>
  <div class="cyber-discover-container">
    <div class="cyber-controls">
      <router-link :to="`/home/${auth.currentUser.uid}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    </div>
    <h1 class="cyber-discover-title">Discover new developpers</h1>

    <div class="cyber-search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search developers by name..."
        class="cyber-search-input"
      />
      <i class="fas fa-search cyber-search-icon"></i>
    </div>

    <div class="cyber-user-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="cyber-user-card">
        <div class="cyber-user-image-wrapper">
          <img @click="GoToprofile(user.id)"
            :src="user.photoURL || defaultPhoto"
            alt="photo de profil"
            class="cyber-user-image"
          />
        </div>
        <h2 class="cyber-user-name">{{ user.name }}</h2>
        <button 
          @click="toggleFollow(user.id)" 
          :class="[isFollowing(user.id) ? 'cyber-unfollow-btn' : 'cyber-connect-btn']"
        >
          <i :class="isFollowing(user.id) ? 'fas fa-user-minus' : 'fas fa-user-plus'" class="cyber-btn-icon"></i>
          <span class="cyber-btn-text">{{ isFollowing(user.id) ? 'Unfollow' : 'Follow' }}</span>
        </button>
      </div>
    </div>
    <div v-if="filteredUsers.length === 0" class="cyber-no-users-message">
      No developers found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = getAuth();
const users = ref([]);
const currentUserFollowings = ref([]);
const searchQuery = ref('');
const defaultPhoto = '/logo.png';

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query)
  );
});

// Check if current user follows this user
const isFollowing = (userId) => {
  return currentUserFollowings.value.includes(userId);
};

// Load users
onMounted(async () => {
  const currentUser = auth.currentUser;

  // Load all users
  const querySnapshot = await getDocs(collection(db, 'users'));
  users.value = querySnapshot.docs
    .filter(doc => doc.id !== currentUser?.uid)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

  // Load current user's followings
  if (currentUser) {
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserSnap = await getDoc(currentUserRef);
    if (currentUserSnap.exists()) {
      currentUserFollowings.value = currentUserSnap.data().followings || [];
    }
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

async function GoToprofile(Id) {
  router.push('/home/' + Id);
}

// Function to toggle follow status
async function toggleFollow(otherUserId) {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid === otherUserId) return;

  try {
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const otherUserRef = doc(db, 'users', otherUserId);
    
    if (isFollowing(otherUserId)) {
      // Unfollow - remove from current user's followings and from other user's followers
      await Promise.all([
        updateDoc(currentUserRef, {
          followings: arrayRemove(otherUserId)
        }),
        updateDoc(otherUserRef, {
          followers: arrayRemove(currentUser.uid)
        })
      ]);
      currentUserFollowings.value = currentUserFollowings.value.filter(id => id !== otherUserId);
    } else {
      // Follow - add to current user's followings and to other user's followers
      await Promise.all([
        updateDoc(currentUserRef, {
          followings: arrayUnion(otherUserId)
        }),
        updateDoc(otherUserRef, {
          followers: arrayUnion(currentUser.uid)
        })
      ]);
      currentUserFollowings.value.push(otherUserId);
    }
  } catch (error) {
    console.error('Error toggling follow status:', error);
  }
}
</script>

<style scoped>
/* Add this new style for unfollow button */
.cyber-unfollow-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 0;
  background-color: rgba(255, 51, 102, 0.2);
  color: #ff3366;
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

.cyber-unfollow-btn:hover {
  background-color: rgba(255, 51, 102, 0.4);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.4);
  transform: translateY(-2px);
}

.cyber-unfollow-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 51, 102, 0.4), transparent);
  transition: 0.5s;
}

.cyber-unfollow-btn:hover::before {
  left: 100%;
}

/* Keep all existing styles below */
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

.cyber-search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.cyber-search-input {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3rem;
  background: rgba(20, 20, 30, 0.8);
  border: 2px solid #00a2ff;
  border-radius: 4px;
  color: #eee;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  transition: all 0.3s;
}

.cyber-search-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 162, 255, 0.5);
  background: rgba(30, 30, 40, 0.8);
}

.cyber-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #00a2ff;
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

  .cyber-connect-btn,
  .cyber-unfollow-btn {
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