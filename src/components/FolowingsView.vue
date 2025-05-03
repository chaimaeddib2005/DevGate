<template>
  <div class="cyber-followings-container">
    <div class="cyber-controls">
      <router-link :to="`/home/${userId}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    </div>
    <h1 class="cyber-followings-title">Followings</h1>

    <!-- Search Bar -->
    <div class="cyber-search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search followings..."
        class="cyber-search-input"
      />
      <i class="fas fa-search cyber-search-icon"></i>
    </div>

    <div v-if="loading" class="cyber-loading-message">Loading...</div>

    <div v-else-if="filteredFollowingUsers.length === 0" class="cyber-no-followings-message">
      <p>No matching followings found</p>
    </div>

    <div v-else class="cyber-user-grid">
      <div v-for="user in filteredFollowingUsers" :key="user.id" class="cyber-user-card">
        <div class="cyber-user-image-wrapper">
          <img @click="GoToprofile(user.id)"
            :src="user.photoURL || defaultImage"
            alt="Profile photo"
            class="cyber-user-image"
          />
        </div>
        <h2 class="cyber-user-name">{{ user.name }}</h2>
        <p class="cyber-user-email">{{ user.email }}</p>
        <button 
          @click="unfollowUser(user.id)" 
          class="cyber-unfollow-btn"
          v-if="isCurrentUser"
        >
          <i class="fas fa-user-minus"></i> Unfollow
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { getDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const auth = getAuth();
const userId = route.params.userId;
const followingUsers = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const defaultImage = '/logo.png';

// Check if the current user is viewing their own followings
const isCurrentUser = computed(() => {
  return auth.currentUser?.uid === userId;
});

// Filter users based on search query
const filteredFollowingUsers = computed(() => {
  if (!searchQuery.value) return followingUsers.value;
  
  const query = searchQuery.value.toLowerCase();
  return followingUsers.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query))
});

onMounted(async () => {
  if (userId) {
    const userRef = doc(db, 'users', userId);
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

async function GoToprofile(Id) {
  router.push('/home/'+Id);
}

async function unfollowUser(userIdToUnfollow) {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', userIdToUnfollow);
    
    // Remove from current user's followings and from target user's followers
    await Promise.all([
      updateDoc(currentUserRef, {
        followings: arrayRemove(userIdToUnfollow)
      }),
      updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId)
      })
    ]);
    
    // Remove from local list
    followingUsers.value = followingUsers.value.filter(user => user.id !== userIdToUnfollow);
    
    console.log('Successfully unfollowed user');
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
}
</script>

<style scoped>
/* Cyber/Developer Theme Styles for My Followings */
.cyber-followings-container {
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

.cyber-followings-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Search Bar Styles */
.cyber-search-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.cyber-search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid #0066ff;
  border-radius: 4px;
  color: #eee;
  font-family: 'Roboto Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s;
}

.cyber-search-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
  background: rgba(30, 30, 40, 0.8);
}

.cyber-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #00a2ff;
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
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
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
  cursor: pointer;
}

.cyber-user-name {
  color: #eee;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.cyber-user-email {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.cyber-unfollow-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
  border: 1px solid #ff3366;
  border-radius: 4px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.cyber-unfollow-btn:hover {
  background: rgba(255, 51, 102, 0.4);
  box-shadow: 0 0 8px rgba(255, 51, 102, 0.4);
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

@media (min-width: 769px) and (max-width: 1024px) {
  .cyber-user-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .cyber-user-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>