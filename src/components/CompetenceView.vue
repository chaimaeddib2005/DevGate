<template>
  <div v-if="competenceId" class="container">
    <div v-if="!editmode" class="competence-card">
      <button @click="deleteCompetence(competenceId)" v-if="isOwner">
        <i class="fas fa-trash-alt"></i> 
      </button>
      <button @click="editmode = !editmode" v-if="isOwner">
        <i class="fas fa-edit"></i>
      </button>

      <p>Skill:<span>{{competence.name}}</span></p>
      <p>Level: <span>{{ competence.level }}</span></p>

      <p v-if="competence.created">Acquisition: {{ formatDate(competence.created) }}</p>
    </div>

    <div v-if="editmode">
      <label>Name:</label>
      <input type="text" v-model="name" @keyup.enter="updateCompetence" />
      <label>Level:</label>
      <select v-model="level" @change="updateCompetence">
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
  props: {isOwner:{
    type:Boolean,
    required:true
  },
    competenceId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      name:"",
      level:"",
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
          this.name = this.competence.name;
          this.level = this.competence.level;
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
    
    // Create the update data object
    const updateData = {
      name: this.name,
      level: this.level,
    };

    // Update Firestore
    await updateDoc(docRef, updateData);

    // Update the local competence object immediately
    this.competence = {
      ...this.competence,
      ...updateData
    };

    // Add timeline entry
    const timeref = await addDoc(collection(db, 'timeline'), {
      ItemId: this.competenceId,
      ItemType: 'compétence',
      Message: 'Updated competence: ' + this.name,
      timestamp: serverTimestamp(),
      type: 'update',
    });

    const currentUser = getAuth().currentUser;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
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

    const currentUser = getAuth().currentUser;
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Add timeline entry
    const timeref = await addDoc(collection(db, 'timeline'), {
      ItemId: competenceId,
      ItemType: 'competence',
      Message: 'Deleted competence: ' + this.competence.name,
      timestamp: serverTimestamp(),
      type: 'delete',
    });

    // Update user document
    await updateDoc(userRef, {
      compétences: arrayRemove(competenceId),
      timeline: arrayUnion(timeref.id),
    });

    // Emit event to parent component
    this.$emit('deleted', competenceId);
    
    // Clear local competence data
    this.competence = {
      name: '',
      level: '',
      created: null
    };
    
    // Reset form fields
    this.name = '';
    this.level = '';
    
    // Close edit mode if open
    this.editmode = false;

    // Optional: Show success notification
    // this.$notify({ type: 'success', message: 'Competence deleted successfully' });

  } catch (error) {
    console.error('Error deleting competence:', error);
    // Optional: Show error notification
    // this.$notify({ type: 'error', message: 'Failed to delete competence' });
  }
  // Removed window.location.reload() - parent will handle the UI update
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
.container{
background: rgba(47, 47, 55, 0.4);
font-family: 'Rajdhani', 'Courier New', monospace;
border-radius: 8px;
padding: 1.5rem;
}
.competence-card {
margin-bottom: 1rem;
position: relative;
transition: all 0.3s ease;
}

.competence-card:hover {
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
}

.competence-card span {
color: #00a2ff;
margin-left: 0.5rem;
font-weight: 600;
}

button {
background: transparent;
color: #00a2ff;
border: none;
margin-right: 7px;
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
  background: rgba(20, 20, 30, 0.9);
  border: 1px solid #444;
  color: #fff;
  border-left: 3px solid #0066ff;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.5rem;
  z-index: 10;
  position: relative;
}

input[type="text"]:focus, select:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.3);
  background: rgba(30, 30, 50, 0.9);
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