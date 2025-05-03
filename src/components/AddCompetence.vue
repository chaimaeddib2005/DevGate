<template>
  <div class="cyber-add-competence">
    <router-link :to="`/Competences/${userId}`" class="btn back-btn">
      <i class="fas fa-arrow-left"></i> Back
    </router-link>

    <h2>Add New Competence</h2>
    <form @submit.prevent="addCompetence" class="cyber-competence-form">
      <div class="cyber-form-group">
        <label for="body" class="cyber-label">Competence Body</label>
        <textarea v-model="competence.name" id="body" required class="cyber-form-input"></textarea>
      </div>
      <div class="cyber-form-group">
        <label for="level" class="cyber-label">Level</label>
        <select v-model="competence.level" id="level" required class="cyber-form-input">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <button type="submit" class="cyber-submit-button">Save Competence</button>
    </form>
  </div>
</template>

<script>
/* Script remains exactly the same */
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  data() {
    return {
      userId: "",
      competence: {
        name: '',
        level: 'beginner',
        created: serverTimestamp(),
        
      },
    };
  },
  async mounted(){
        const user = getAuth().currentUser;
      if (user) {
        this.userId = user.uid;
      }
  },
  methods: {
    async addCompetence() {
      try {
        const competenceRef = await addDoc(collection(db, 'compétences'), this.competence);
        console.log('Competence added with ID: ', competenceRef.id);
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: competenceRef.id,
          ItemType: 'compétence',
          Message: 'New competence is added: ' + this.competence.name,
          timestamp: serverTimestamp(),
          type: 'add',
        });
        const user = getAuth().currentUser;
      
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          compétences: arrayUnion(competenceRef.id),
          timeline: arrayUnion(timeref.id),
        });
        this.$router.push('/Competences/'+user.uid); // Redirect to competence list
      } catch (error) {
        console.error('Error adding competence: ', error);
      }
    },
  },
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Add Competence */
.cyber-add-competence {
  padding: 2.5rem;
  position: relative;
  z-index: 1;
  background: rgba(10, 10, 20);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  text-decoration: none;
  font-weight: bold;
  letter-spacing: 0.5px;
  border-radius: 0;
  background: rgba(50, 50, 50, 0.7);
  color: #eee;
  border: 1px solid #777;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10; /* Ensure it's above other elements */
}

.back-btn:hover {
  background: rgba(70, 70, 70, 0.9);
  text-shadow: none;
  animation: none;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.cyber-add-competence h2 {
  color: #00a2ff;
  text-align: center;
  margin-bottom: 2rem;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 102, 255, 0.6);
  padding-top: 2rem; /* Add some top padding to avoid overlap */
}

.cyber-competence-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cyber-form-group {
  position: relative;
}

.cyber-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #eee;
  font-weight: 600;
  text-shadow: 0 0 3px rgba(0, 102, 255, 0.5);
}

.cyber-form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #0066ff;
  border-radius: 0;
  background-color: rgba(20, 20, 30, 0.8);
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.cyber-form-input:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

textarea.cyber-form-input {
  min-height: 120px;
  resize: vertical;
}

select.cyber-form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.cyber-add-competence {
  min-height: 100vh;
  background: rgba(10, 10, 20); /* already present */
}


.cyber-submit-button {
  background-color: rgba(0, 102, 255, 0.2);
  color: #00a2ff;
  border: 2px solid #0066ff;
  padding: 0.9rem 2rem;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 0;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-submit-button:hover {
  background: rgba(0, 102, 255, 0.4);
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.5);
  transform: translateY(-2px);
}

.cyber-submit-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.5), transparent);
  transition: 0.5s;
}

.cyber-submit-button:hover::before {
  left: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-add-competence {
    padding: 1.5rem;
  }

  .back-btn {
    position: static;
    width: 100%;
    margin-bottom: 1rem;
  }

  .cyber-add-competence h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    padding-top: 0;
  }

  .cyber-form-input,
  .cyber-submit-button {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}
</style>