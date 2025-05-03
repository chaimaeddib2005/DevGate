import { ref } from 'vue'
import { auth, db } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore'

// Reactive user and auth loading states
const user = ref(null)
const authLoading = ref(true)

const getUserData = async (firebaseUser) => {
  if (!firebaseUser) return null
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  if (userDoc.exists()) {
    return { 
      ...firebaseUser,
      ...userDoc.data() 
    }
  }
  return firebaseUser
}

// Auth state observer
onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user.value = await getUserData(currentUser)
  } else {
    user.value = null
  }
  authLoading.value = false
})

// Register function
const register = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const newUser = userCredential.user

  // Save to Firestore with name
  await setDoc(doc(db, 'users', newUser.uid), {
    uid: newUser.uid,
    email: newUser.email,
    name: name || '',
    photoURL: '',
    role: 'normal'
  })

  await sendEmailVerification(newUser)
  await signOut(auth)

  return userCredential
}

// Login with email/password
const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

// Reset password
const resetPassword = (email) => sendPasswordResetEmail(auth, email)

// Google login
const googleLogin = async () => {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  const googleUser = userCredential.user

  const userDocRef = doc(db, 'users', googleUser.uid)
  const userSnap = await getDoc(userDocRef)

  if (!userSnap.exists()) {
    await setDoc(userDocRef, {
      uid: googleUser.uid,
      email: googleUser.email,
      name: googleUser.displayName || '',
      photoURL: googleUser.photoURL || '',
      role: 'normal'
    })
  }

  return userCredential
}

// Anonymous login
const anonymousLogin = () => signInAnonymously(auth)

// Logout function
const logout = async () => {
  try {
    await signOut(auth)
    user.value = null
    return true
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Get current user
const getCurrentUser = () => user.value

// Export composable
export const useAuth = () => {
  return {
    user,
    authLoading,
    register,
    login,
    resetPassword,
    googleLogin,
    anonymousLogin,
    logout,
    getCurrentUser
  }
}