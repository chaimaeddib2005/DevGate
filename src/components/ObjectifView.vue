<template>
  <div v-if="objectifId" class="cyber-objectif-card-container">
    <div v-if="!editmode" class="cyber-objectif-card">
      <div class="cyber-card-actions">
        <button @click="deleteObjectif(objectifId)" class="cyber-delete-btn" v-if="isOwner">
          <i class="fas fa-trash-alt cyber-btn-icon"></i>
          <span class="cyber-btn-text">Delete</span>
        </button>
        <button @click="editmode = !editmode" class="cyber-edit-btn" v-if="isOwner">
          <i class="fas fa-edit cyber-btn-icon"></i>
          <span class="cyber-btn-text">Edit</span>
        </button>
      </div>
      <h3 class="cyber-objectif-name">{{ objectif.name }}</h3>
      <p class="cyber-objectif-status">Status: <span>{{ objectif.status }}</span></p>

      <div class="cyber-progress-bar-container">
        <label class="cyber-label">Progress:</label>
        <div class="cyber-progress-bar" :style="{ width: objectif.progress + '%' }">
          <span class="cyber-progress-text">{{ objectif.progress }}%</span>
        </div>
      </div>

      <p v-if="objectif.created" class="cyber-objectif-created">Created: {{ formatDate(objectif.created) }}</p>
    </div>

    <div v-if="editmode" class="cyber-objectif-edit-form">
      <div class="cyber-form-group">
        <label for="name" class="cyber-label">Name:</label>
        <input type="text" v-model="objectif.name" id="name" @keyup.enter="updateObjectif" class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="status" class="cyber-label">Status:</label>
        <input type="text" v-model="objectif.status" id="status" @keyup.enter="updateObjectif" class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="progress" class="cyber-label">Progress:</label>
        <input
          type="number"
          v-model="objectif.progress"
          id="progress"
          @keyup.enter="updateObjectif"
          min="0"
          max="100"
          class="cyber-form-input"
        />
      </div>
      <div class="cyber-form-actions">
        <button @click="updateObjectif" class="cyber-save-btn">
          <i class="fas fa-save cyber-btn-icon"></i>
          <span class="cyber-btn-text">Save</span>
        </button>
        <button @click="editmode = false" class="cyber-cancel-btn">
          <i class="fas fa-times-circle cyber-btn-icon"></i>
          <span class="cyber-btn-text">Cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* Script remains exactly the same */
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  props: {
    isOwner:{
      type:Boolean,
      required:true,
    },
    objectifId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      objectif: {},
      editmode: false,
    };
  },

  mounted() {
    if (this.objectifId) {
      this.fetchObjectif();
    }
  },

  methods: {
    async fetchObjectif() {
      try {
        const docRef = doc(db, 'objectifs', this.objectifId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.objectif = docSnap.data();
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    },

    async updateObjectif() {
      try {
        const docRef = doc(db, 'objectifs', this.objectifId);
        await updateDoc(docRef, {
          body: this.objectif.name,
          status: this.objectif.status,
          progress: this.objectif.progress,
        });

        const upodateRef = await addDoc(collection(db, 'timeline'), {
          ItemId: this.objectifId,
          ItemType: 'objectif',
          Message: 'New modifications on the objectif ' + this.objectif.body,
          timestamp: serverTimestamp(),
          type: 'update',
        });
        const user = getAuth().currentUser;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          timeline: arrayUnion(upodateRef.id),
        });

        this.editmode = false;
        console.log('Objectif updated and timeline entry added.');
      } catch (error) {
        console.error('Error updating or logging modification:', error);
      }
    },

    async deleteObjectif(objectifId) {
      try {
        const docRef = doc(db, 'objectifs', objectifId);
        await deleteDoc(docRef);
        console.log('Document successfully deleted!');
        const user = getAuth().currentUser;
        const userRef = doc(db, 'users', user.uid);

        const midfRef = await addDoc(collection(db, 'timeline'), {
          ItemId: objectifId,
          ItemType: 'objectif',
          Message: 'Deleted objectif: ' + this.objectif.name,
          timestamp: serverTimestamp(),
          type: 'delete',
        });
        await updateDoc(userRef, {
          objectifs: arrayRemove(objectifId),
          timeline: arrayUnion(midfRef.id),
        });
      } catch (error) {
        console.error('Error removing document:', error);
      }
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
/* Cyber/Developer Theme Styles for Objectif Card */
.cyber-objectif-card-container {
  background: rgba(47, 47, 55, 0.3);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 450px;
}

.cyber-objectif-card-container:hover {
  transform: translateY(-2px);
}

.cyber-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cyber-delete-btn,
.cyber-edit-btn {
  background-color: rgba(20, 20, 30, 0.0);
  border: none;
  display: inline-flex;
  color: #ff4d4d;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cyber-edit-btn {
  border-color: #00a2ff;
  color: #00a2ff;
}

.cyber-delete-btn:hover,
.cyber-edit-btn:hover {
  transform: translateY(-1px);
}


.cyber-btn-icon {
  font-size: 0.9rem;
}

.cyber-btn-text {
  position: relative;
}

.cyber-objectif-name {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.cyber-objectif-status {
  color: #eee;
  margin-bottom: 0.3rem;
}
.cyber-label{
  color: white;
}
.cyber-objectif-status span {
  font-weight: bold;
}

.cyber-progress-bar-container {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.cyber-progress-bar {
  background-color: #00a2ff;
  height: 15px;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.cyber-progress-text {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #fff;
  font-size: 0.8rem;
}

.cyber-objectif-created {
  color: #aaa;
  font-size: 0.8rem;
  margin-top: 0.8rem;
}

/* Edit Mode Styles */
.cyber-objectif-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid #0066ff;
  border-radius: 0;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.4);
}

.cyber-objectif-edit-form .cyber-form-group {
  display: flex;
  flex-direction: column;
}

.cyber-objectif-edit-form .cyber-label {
  color: #eee;
  font-weight: bold;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.cyber-objectif-edit-form .cyber-form-input {
  padding: 0.6rem;
  border: 1px solid #00a2ff;
  border-radius: 0;
  background-color: rgba(30, 30, 40, 0.9);
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
}

.cyber-objectif-edit-form .cyber-form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.cyber-save-btn,
.cyber-cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cyber-save-btn {
  background-color: rgba(0, 162, 255, 0.2);
  color: #00a2ff;
}

.cyber-cancel-btn {
  background-color: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.cyber-save-btn:hover {
  background-color: rgba(0, 162, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 162, 255, 0.7);
  transform: translateY(-1px);
}

.cyber-cancel-btn:hover {
  background-color: rgba(255, 77, 77, 0.4);
  box-shadow: 0 0 8px rgba(255, 77, 77, 0.7);
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-objectif-card-container {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .cyber-card-actions {
    flex-direction: column;
    gap: 0.3rem;
  }

  .cyber-delete-btn,
  .cyber-edit-btn {
    width: 100%;
    justify-content: center;
  }

  .cyber-objectif-edit-form {
    padding: 1rem;
  }

  .cyber-objectif-edit-form .cyber-form-actions {
    flex-direction: column;
    gap: 0.3rem;
    align-items: stretch;
  }

  .cyber-save-btn,
  .cyber-cancel-btn {
    width: 100%;
  }
}
</style>