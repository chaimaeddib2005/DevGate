// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';  // Correct import for Firestore in v9+
import { getAuth } from 'firebase/auth';            // Correct import for Auth in v9+
import { getStorage } from 'firebase/storage';      // Correct import for Storage in v9+

const firebaseConfig = {
  apiKey: "AIzaSyDy7xbLF4eIjdcX5AdwocDbBYyIzoEUHAI",
  authDomain: "devgate-87bab.firebaseapp.com",
  projectId: "devgate-87bab",
  storageBucket: "devgate-87bab.firebasestorage.app",
  messagingSenderId: "561166388901",
  appId: "1:561166388901:web:099e7956b2f597e451074c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };  // Exporting services
