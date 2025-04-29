<template>
  <div class="add-competence">
      <h2>Add New Competence</h2>
      <form @submit.prevent="addCompetence" class="competence-form">
          <div class="form-group">
              <label for="body">Competence Body</label>
              <textarea v-model="competence.name" id="body" required class="form-input"></textarea>
          </div>
          <div class="form-group">
              <label for="level">Level</label>
              <select v-model="competence.level" id="level" required class="form-input">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
              </select>
          </div>
          
          <button type="submit" class="submit-button">Save Competence</button>
      </form>
  </div>
</template>

<script>
/* Script remains exactly the same */
import {db } from '@/firebase';
import {collection,addDoc,serverTimestamp,updateDoc,arrayUnion,doc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth';


export default {
  data() {
      return {
          competence: {
              name: '',
              level: 'beginner',
              created: serverTimestamp(),
          },
      };
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
              this.$router.push('/Competences' ); // Redirect to competence list or details page
          } catch (error) {
              console.error('Error adding competence: ', error);
          }
      },
  },
};
</script>

<style scoped>
.add-competence {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
}

h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5rem;
}

.competence-form {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #45a049;
}
</style>