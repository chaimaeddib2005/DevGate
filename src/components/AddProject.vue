<template>
  <div class="cyber-add-project">
    <router-link to="/projects" class="btn back-btn">
      <i class="fas fa-arrow-left"></i> Back
    </router-link>

    <h2 class="cyber-form-title">Add New Project</h2>
    <form @submit.prevent="addProject" class="cyber-form">
      <div class="cyber-form-group">
        <label for="name" class="cyber-label">Project Name</label>
        <input type="text" v-model="project.name" id="name" required class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="description" class="cyber-label">Description</label>
        <textarea v-model="project.description" id="description" required class="cyber-form-input"></textarea>
      </div>
      <div class="cyber-form-group">
        <label for="githubLink" class="cyber-label">GitHub Link</label>
        <input type="url" v-model="project.githubLink" id="githubLink" required class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="tools" class="cyber-label">Tools (comma separated)</label>
        <input
          type="text"
          v-model="toolsInput"
          id="tools"
          @blur="parseTools"
          required
          class="cyber-form-input"
        />
      </div>
      <div class="cyber-form-group">
        <label for="image" class="cyber-label">Project Image</label>
        <input type="file" @change="handleImageUpload" id="image" class="cyber-form-input" />
      </div>
      <button type="submit" class="cyber-submit-button">
        <i class="fas fa-save cyber-btn-icon"></i>
        <span class="cyber-btn-text">Save Project</span>
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
      project: {
        name: '',
        description: '',
        githubLink: '',
        tools: [],
        created: serverTimestamp(),
        image: '',
      },
      toolsInput: '',
    };
  },
  methods: {
    parseTools() {
      this.project.tools = this.toolsInput.split(',').map((t) => t.trim()).filter(Boolean);
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.project.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async addProject() {
      try {
        const projectRef = await addDoc(collection(db, 'projects'), this.project);
        console.log('Project added with ID: ', projectRef.id);
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: projectRef.id,
          ItemType: 'project',
          Message: 'New project is added: ' + this.project.name,
          timestamp: serverTimestamp(),
          type: 'add',
        });
        const user = getAuth().currentUser;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          projects: arrayUnion(projectRef.id),
          timeline: arrayUnion(timeref.id),
        });
        this.$router.push('/projects'); // Redirect to project list
      } catch (error) {
        console.error('Error adding project: ', error);
      }
    },
  },
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Add Project Form */
.cyber-add-project {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(10, 10, 20, 0.7);
  border: 1px solid rgba(0, 102, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.15);
  position: relative; /* For positioning the back button */
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  text-decoration: none;
  font-family: 'Roboto Mono', monospace;
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

.cyber-form-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 5px rgba(0, 102, 255, 0.6);
  padding-top: 2rem; /* Add some top padding to avoid overlap */
}

.cyber-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cyber-form-group {
  display: flex;
  flex-direction: column;
}

.cyber-label {
  color: #eee;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 3px rgba(0, 102, 255, 0.5);
}

.cyber-form-input {
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

.cyber-form-input[type="file"] {
  padding: 0.5rem;
}

.cyber-form-input::placeholder {
  color: #aaa;
}

.cyber-submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0;
  background-color: rgba(0, 102, 255, 0.2);
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  position: relative;
  overflow: hidden;
}

.cyber-submit-button:hover {
  background-color: rgba(0, 102, 255, 0.4);
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
  background: linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.4), transparent);
  transition: 0.5s;
}

.cyber-submit-button:hover::before {
  left: 100%;
}

.cyber-btn-icon {
  font-size: 1.2rem;
}

.cyber-btn-text {
  position: relative;
}

textarea.cyber-form-input {
  min-height: 100px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-add-project {
    padding: 1.5rem;
    margin: 1.5rem;
  }

  .back-btn {
    position: static;
    width: 100%;
    margin-bottom: 1rem;
  }

  .cyber-form-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    padding-top: 0;
  }

  .cyber-form {
    gap: 1rem;
  }

  .cyber-label {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .cyber-form-input {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .cyber-submit-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>