<template>
    <div class="min-h-screen bg-gray-100 p-6">
      <h1 class="text-3xl font-bold mb-8">Découvrir des développeurs</h1>
  
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="user in users" :key="user.id"
          class="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center justify-center">
          <img :src="user.photoURL || defaultPhoto" alt="photo de profil"
            class="w-20 h-20 rounded-full object-cover mb-4" />
          <h2 class="text-xl font-semibold">{{ user.name }}</h2>
  
          <button @click="connectUser(user.id)"
            class="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl">
            Connecter
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { db } from '../firebase'
  
  const users = ref([])
  const defaultPhoto = 'https://via.placeholder.com/150' // Image par défaut si pas de photoURL
  
  // Charger les utilisateurs
  onMounted(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'))
    users.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
  
  // Fonction pour connecter à un utilisateur
  async function connectUser(otherUserId) {
    const auth = getAuth()
    const currentUser = auth.currentUser
  
    if (currentUser && currentUser.uid !== otherUserId) {
      const currentUserRef = doc(db, 'users', currentUser.uid)
  
      await updateDoc(currentUserRef, {
        followings: arrayUnion(otherUserId)
      })
  
      alert('Connecté avec succès 🎉')
    } else {
      alert('Erreur : vous ne pouvez pas vous connecter à vous-même.')
    }
  }
  </script>
  