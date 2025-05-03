<template>
  <div class="cyber-add-objectif-container">
    <div class="cyber-controls">
      <router-link :to="`/objectifs/${userId}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> Back
      </router-link>
    </div>
    <h2 class="cyber-add-objectif-title">Add New Objectif</h2>
    <form @submit.prevent="addObjectif" class="cyber-add-objectif-form">
      <div class="cyber-form-group">
        <label for="name" class="cyber-label">Objectif Name</label>
        <textarea v-model="objectif.name" id="name" required class="cyber-form-input"></textarea>
      </div>
      <div class="cyber-form-group">
        <label for="status" class="cyber-label">Status</label>
        <select v-model="objectif.status" id="status" required class="cyber-form-select">
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="planning">Planning</option>
          <option value="on hold">On Hold</option>
        </select>
      </div>
      <div class="cyber-form-group">
        <label for="progress" class="cyber-label">Progress (%)</label>
        <input
          type="number"
          v-model="objectif.progress"
          id="progress"
          min="0"
          max="100"
          required
          class="cyber-form-input"
        />
      </div>
      <button type="submit" class="cyber-save-btn">
        <i class="fas fa-plus-circle cyber-btn-icon"></i>
        <span class="cyber-btn-text">Save Objectif</span>
      </button>
    </form>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  data() {
   
    return {
      userId: "",
      objectif: {
        name: '',
        status: 'in progress',
        progress: 0,
        created: serverTimestamp(),
      },
    };
  },
  async mounted(){
    const user = getAuth().currentUser;
    if(user){
      this.userId = user.uid;
    }
  },
  methods: {
    async addObjectif() {
      try {
        const objectifRef = await addDoc(collection(db, 'objectifs'), this.objectif);
        console.log('Objectif added with ID: ', objectifRef.id);
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: objectifRef.id,
          ItemType: 'objectif',
          Message: 'New objectif is added: ' + this.objectif.name,
          timestamp: serverTimestamp(),
          type: 'add',
        });
        const user = getAuth().currentUser;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          objectifs: arrayUnion(objectifRef.id),
          timeline: arrayUnion(timeref.id),
        });
        this.$router.push('/objectifs/'+user.uid); // Redirect to objectif list
      } catch (error) {
        console.error('Error adding objectif: ', error);
      }
    },
  },
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Add Objectif */

.cyber-add-objectif-container {
  margin: 0 auto;
  padding: 2rem;
  background: rgba(10, 10, 20);
  height: 1000px;
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

.cyber-add-objectif-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-add-objectif-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cyber-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cyber-label {
  color: #eee;
  font-weight: bold;
  font-size: 0.9rem;
}

.cyber-form-input,
.cyber-form-select {
  padding: 0.8rem;
  border: 1px solid #0066ff;
  border-radius: 0;
  background-color: rgba(20, 20, 30, 0.8);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cyber-form-input:focus,
.cyber-form-select:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.cyber-form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

.cyber-form-input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}

.cyber-form-input[type="number"]::-webkit-outer-spin-button,
.cyber-form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cyber-save-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 0;
  background-color: rgba(0, 102, 255, 0.2);
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.cyber-save-btn:hover {
  background-color: rgba(0, 102, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.4);
  transform: translateY(-2px);
}

.cyber-save-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.4), transparent);
  transition: 0.5s;
}

.cyber-save-btn:hover::before {
  left: 100%;
}

.cyber-btn-icon {
  font-size: 1.2rem;
}

.cyber-btn-text {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-add-objectif-container {
    padding: 1.5rem;
  }

  .cyber-add-objectif-form {
    gap: 1rem;
  }

  .cyber-form-group {
    gap: 0.3rem;
  }

  .cyber-form-input,
  .cyber-form-select {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .cyber-save-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}
</style>