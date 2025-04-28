<template>
    <div class="min-h-screen bg-gray-100 p-6">
      <h1 class="text-3xl font-bold mb-8">Mes Followings</h1>
  
      <div v-if="loading" class="text-center">Chargement...</div>
  
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="user in followingUsers" :key="user.id" class="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
          <img :src="user.photoURL || defaultImage" alt="photo" class="w-20 h-20 rounded-full object-cover mb-4" />
          <h2 class="text-xl font-semibold">{{ user.name }}</h2>
          <p class="text-gray-500 text-sm">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAuth } from 'firebase/auth'
  import { db } from '@/firebase'
  import { getDoc, doc} from 'firebase/firestore'
  
  const followingUsers = ref([])
  const loading = ref(true)
  const defaultImage = 'https://via.placeholder.com/150'
  
  onMounted(async () => {
    const auth = getAuth()
    const user = auth.currentUser
  
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
  
      if (userSnap.exists()) {
        const followings = userSnap.data().followings || []
  
        if (followings.length > 0) {
          const promises = followings.map(uid => getDoc(doc(db, 'users', uid)))
          const results = await Promise.all(promises)
  
          followingUsers.value = results
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }))
        }
      }
    }
  
    loading.value = false
  })
  </script>
  