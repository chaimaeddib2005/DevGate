<template>
  <div class="container">
    
    <aside class="profile">
      <img :src="userData.photoURL || defaultImage" alt="photo de profil" class="profile-img" />
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
      <p>LinkedIn : {{ userData.linkedin }}</p> 
      <p>description : {{ userData.description }}</p>
      
      <button @click="goToEditProfile" class="btn edit-btn">Éditer Profil</button>

      <!-- New Followers/Followings section -->
      <div class="follows">
         <div @click="goToFollowings" class="follow-item">
          <span class="follow-number">{{ userData.followings?.length || 0 }}</span> Followings
         </div>
         <div @click="goToFollowers" class="follow-item">
             <span class="follow-number">{{ userData.followers?.length || 0 }}</span> Followers
          </div>
      </div>
      
    </aside>

    <!-- Right Side -->
    <div class="content">
      <!-- Discover button top right -->
      <div class="top-bar">
        <button @click="goToDiscover" class="btn discover-btn">Discover</button>
      </div>

      <!-- Blocks -->
      <div class="blocks">
        <div class="block" v-for="item in navItems" :key="item.title" @click="navigateTo(item.route)">
          <div class="block-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
   
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'

import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const router = useRouter()
const userData = ref({})
const defaultImage = 'https://via.placeholder.com/150'

const navItems = [
  { title: 'Compétences', route: '/Competences', icon: '🛠️', description: 'Gérez vos compétences.' },
  { title: 'Projets', route: '/Projects', icon: '🚀', description: 'Partagez vos projets.' },
  { title: 'Activité', route: '/timeline', icon: '📈', description: 'Suivez votre activité.' },
  { title: 'Objectifs', route: '/Objectifs', icon: '🎯', description: 'Atteignez vos objectifs.' },
  {title: 'Visualize my progress',route: '/visualize', icon: '📊', description: 'Visualisez vos progrès.'},
  
]

function goToEditProfile() {
  router.push('/edit-profile')
}

function goToDiscover() {
  router.push('/discover')
}

function navigateTo(route) {
  router.push(route)
}

function goToFollowings() {
   router.push('/followings')
}

function goToFollowers() {
   router.push('/followers')
}


onMounted(async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      userData.value = userSnap.data()
    }
  }
})
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  background-color: #f7fafc;
}

/* Left Profile */
.profile {
  width: 250px;
  background: white;
  padding: 30px;
  text-align: center;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.profile-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
}

.profile h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.profile p {
  font-size: 14px;
  color: #555;
}

/* Main content */
.content {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}

/* Discover button */
.discover-btn {
  background-color: #38a169;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  transition: background 0.3s;
}

.discover-btn:hover {
  background-color: #2f855a;
}

/* Blocks */
.blocks {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.block {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.block:hover {
  transform: translateY(-8px);
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.2);
}

.block-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.block h3 {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
}

.block p {
  font-size: 14px;
  color: #666;
}

/* Buttons */
.btn {
  cursor: pointer;
  border: none;
  outline: none;
}

/* Edit button */
.edit-btn {
  background-color: #4299e1;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 15px;
  font-weight: bold;
  transition: background 0.3s;
}

.edit-btn:hover {
  background-color: #3182ce;
}


.follows {
margin-top: 30px;
border-top: 1px solid #ddd;
padding-top: 20px;
width: 100%;
text-align: center;
}

.follow-item {
margin: 10px 0;
font-weight: bold;
color: #4299e1;
cursor: pointer;
transition: color 0.3s;
}

.follow-item:hover {
color: #2b6cb0;
}

.follow-number {
font-weight: bold;
margin-right: 5px;
}

</style>
