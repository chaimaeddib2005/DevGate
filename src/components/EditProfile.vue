<template>
    <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-8">Modifier mon profil</h1>
  
      <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
        <form @submit.prevent="saveProfile">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Nom</label>
            <input v-model="name" type="text" class="w-full border p-2 rounded-md" required />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Email</label>
            <input v-model="email" type="email" class="w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed" disabled />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">LinkedIn (URL)</label>
            <input v-model="linkedin" type="url" class="w-full border p-2 rounded-md" />
          </div>
  
          <!-- Drag & Drop ou bouton pour sélectionner une image -->
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Photo de profil (upload depuis votre ordinateur)</label>
            <input type="file" @change="handleImageUpload" class="w-full border p-2 rounded-md" accept="image/*" />
            <div v-if="uploadProgress > 0" class="mt-2 text-sm text-gray-600">Téléchargement: {{ uploadProgress }}%</div>
            <img v-if="photoURL" :src="photoURL" alt="Preview" class="mt-4 w-32 h-32 rounded-full object-cover mx-auto" />
          </div>
  
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Description</label>
            <textarea v-model="description" rows="4" class="w-full border p-2 rounded-md"></textarea>
          </div>
  
          <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl">
            Enregistrer
          </button>
        </form>
      </div>
  
      <div v-if="successMessage" class="text-green-600 mt-4">
        {{ successMessage }}
      </div>
  
      <div v-if="errorMessage" class="text-red-600 mt-4">
        {{ errorMessage }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import { db, storage } from '@/firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
  
  const router = useRouter()
  
  const name = ref('')
  const email = ref('')
  const linkedin = ref('')
  const photoURL = ref('')
  const description = ref('')
  const successMessage = ref('')
  const errorMessage = ref('')
  const uploadProgress = ref(0)
  
  onMounted(async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
  
      if (userSnap.exists()) {
        const data = userSnap.data()
        name.value = data.name || ''
        email.value = data.email || ''
        linkedin.value = data.linkedin || ''
        photoURL.value = data.photoURL || ''
        description.value = data.description || ''
      }
    } else {
      router.push('/login')
    }
  })
  
  async function saveProfile() {
    successMessage.value = ''
    errorMessage.value = ''
  
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      errorMessage.value = 'Utilisateur non connecté.'
      return
    }
  
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        name: name.value,
        linkedin: linkedin.value,
        photoURL: photoURL.value,
        description: description.value
      })
  
      successMessage.value = 'Profil mis à jour avec succès !'
      setTimeout(() => router.push('/home'), 2000)
    } catch (err) {
      console.error(err)
      errorMessage.value = 'Erreur lors de la mise à jour du profil.'
    }
  }
  
  async function handleImageUpload(event) {
   const file = event.target.files[0];
   if (!file) return;

   const auth = getAuth();
   const user = auth.currentUser;
   if (!user) {
     errorMessage.value = 'Utilisateur non connecté.';
    return;
   }

   const storageReference = storageRef(storage, `profileImages/${user.uid}/${file.name}`);
   const uploadTask = uploadBytesResumable(storageReference, file);

   uploadTask.on('state_changed',
    (snapshot) => {
      uploadProgress.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    },
    (error) => {
      console.error('Upload error:', error);
      errorMessage.value = 'Erreur lors de l\'upload de l\'image.';
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('Téléchargement terminé: ', downloadURL);

      try {
        const userDocRef = doc(db, 'users', user.uid); // 📢 ATTENTION ici
        await updateDoc(userDocRef, { photoURL: downloadURL });

        // Mettre à jour aussi localement pour affichage instantané
        photoURL.value = downloadURL;
        successMessage.value = 'Photo de profil mise à jour avec succès ✅';
        console.log('Firestore updated successfully.');
      } catch (e) {
        console.error('Erreur Firestore update:', e);
        errorMessage.value = 'Erreur lors de la mise à jour du profil.';
      }
    }
  );
}


  
  </script>
  