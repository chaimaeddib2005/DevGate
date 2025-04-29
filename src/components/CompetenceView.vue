<template>
    <div v-if="competenceId">
      <div v-if="!editmode" class="competence-card">
        <button @click="deleteCompetence(competenceId)">
          Delete
        </button>
        <button @click="editmode = !editmode">
         Modify
        </button>
  
        <p>Body:<span>{{competence.name}}</span></p>
        <p>Level: <span>{{ competence.level }}</span></p>
  
        <p v-if="competence.created">Aquization: {{ formatDate(competence.created) }}</p>
      </div>
  
      <div v-if="editmode">
        <label>Name:</label>
        <input type="text" v-model="competence.name" @keyup.enter="updateCompetence" />
        <label>Level:</label>
        <select v-model="competence.level" @change="updateCompetence">
          <option value="begginer">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button @click="updateCompetence">Save</button>
        <button @click="editmode = false">Cancel</button>
      </div>
    </div>
  </template> 
  
  <script>

  import {
    db
  
  } from '@/firebase';
  
 import {  doc,
    getDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    collection,
    serverTimestamp,
    arrayRemove,
    arrayUnion} from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  export default {
    props: {
      competenceId: {
        type: String,
        required: true,
      },
    },
  
    data() {
      return {
        competence: {},
        editmode: false,
      };
    },
  
    mounted() {
      if (this.competenceId) {
        this.fetchCompetence();
      }
    },
  
    methods: {
      async fetchCompetence() {
        try {
          const docRef = doc(db, 'compétences', this.competenceId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            this.competence = docSnap.data();
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching competence:', error);
        }
      },
  
      async updateCompetence() {
        try {
          const docRef = doc(db, 'compétences', this.competenceId);
          await updateDoc(docRef, {
            name: this.competence.name,
            level: this.competence.level,
          });
  
          const timeref = await addDoc(collection(db, 'timeline'), {
            ItemId: this.competenceId,
            ItemType: 'compétence',
            Message: 'Updated competence: ' + this.competence.body,
            timestamp: serverTimestamp(),
            type: 'update',
          });
          const currentUser = getAuth().currentUser;
          const userRef = doc(db, 'users', currentUser.uid);
          updateDoc(userRef, {
            timeline: arrayUnion(timeref.id),
          });
  
          this.editmode = false;
          console.log('Competence updated and timeline entry added.');
        } catch (error) {
          console.error('Error updating or logging modification:', error);
        }
      },
  
      async deleteCompetence(competenceId) {
        try {
          const docRef = doc(db, 'compétences', competenceId);
          await deleteDoc(docRef);
          console.log('Competence successfully deleted!');
        } catch (error) {
          console.error('Error deleting competence:', error);
        }
        const currentUser = getAuth().currentUser;
        console.log(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: competenceId,
          ItemType: 'competence',
          Message: 'Deleted competence: ' + this.competence.name,
          timestamp: serverTimestamp(),
          type: 'delete',
        });
        await updateDoc(userRef, {
          compétences: arrayRemove(competenceId),
          timeline: arrayUnion(timeref.id),
        });
        window.location.reload();
      },
  
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  };
  </script>
  <style scoped>
/* Cyber/Developer Theme Styles */
.competence-card {
  background: rgba(20, 20, 30, 0.7);
  border: 1px solid #0066ff;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.3);
  transition: all 0.3s ease;
}

.competence-card:hover {
  box-shadow: 0 0 25px rgba(0, 102, 255, 0.5);
  transform: translateY(-3px);
}

.competence-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(
      45deg,
      transparent 48%,
      rgba(0, 102, 255, 0.1) 50%,
      transparent 52%
    );
  background-size: 5px 5px;
  opacity: 0.5;
}

.competence-card p {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin: 0.8rem 0;
  font-family: 'Courier New', monospace;
}

.competence-card span {
  color: #00a2ff;
  margin-left: 0.5rem;
  font-weight: 600;
}

button {
  background: transparent;
  color: #00a2ff;
  border: 2px solid #0066ff;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

button:hover {
  background: rgba(0, 102, 255, 0.1);
  text-shadow: 0 0 8px rgba(0, 102, 255, 0.7);
  animation: glitch 0.5s linear infinite;
}

button:active {
  transform: translateY(2px);
}

/* Edit mode styling */
div[v-if="editmode"] {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid #0066ff;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
}

label {
  display: block;
  color: #00a2ff;
  margin: 0.8rem 0 0.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

input[type="text"], select {
  width: 100%;
  padding: 0.7rem;
  background: rgba(30, 30, 40, 0.8);
  border: 1px solid #333;
  color: #e0e0e0;
  border-left: 3px solid #0066ff;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.5rem;
}

input[type="text"]:focus, select:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.3);
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300a2ff'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5rem;
}

/* Glitch animation */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

/* Delete button specific styling */
button[on*="deleteCompetence"] {
  color: #ff3366;
  border-color: #ff3366;
}

button[on*="deleteCompetence"]:hover {
  background: rgba(255, 51, 102, 0.1);
  text-shadow: 0 0 8px rgba(255, 51, 102, 0.7);
}
</style>