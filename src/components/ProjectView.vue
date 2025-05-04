<template>
  <div v-if="projectId" class="cyber-project-details">
    <div v-if="!editmode" class="cyber-card">
      <div class="cyber-card-header">
        <h2 class="cyber-card-title">{{ project.name }}</h2>
        <div class="cyber-card-actions" v-if="isOwner">
          <button @click="deleteProject(projectId)" class="cyber-delete-btn">
            <i class="fas fa-trash-alt cyber-btn-icon"></i>
            <span class="cyber-btn-text">Delete</span>
          </button>
          <button @click="editmode = !editmode" class="cyber-edit-btn">
            <i class="fas fa-edit cyber-btn-icon"></i>
            <span class="cyber-btn-text">Edit</span>
          </button>
        </div>
      </div>
      <div class="cyber-card-body">
        <p class="cyber-card-text">
          <span class="cyber-label">Name:</span> {{ project.name }}
        </p>
        <p class="cyber-card-text">
          <span class="cyber-label">Description:</span> {{ project.description }}
        </p>
        <p class="cyber-card-text">
          <span class="cyber-label">GitHub:</span>
          <a :href="project.githubLink" target="_blank" class="cyber-link">{{ project.githubLink }}</a>
        </p>
        <p class="cyber-card-text">
          <span class="cyber-label">Tools:</span>
          <span v-for="tool in project.tools" :key="tool" class="cyber-tag">{{ tool }}</span>
        </p>
        <p class="cyber-card-text">
          <span class="cyber-label">Created:</span> {{ formatDate(project.created) }}
        </p>
        <img
          v-if="project.image"
          :src="project.image"
          alt="Project Image"
          class="cyber-project-image"
        />
      </div>
    </div>

    <div v-else class="cyber-card cyber-edit-form">
      <h3 class="cyber-form-title">Edit Project</h3>
      <div class="cyber-form-group">
        <label for="name" class="cyber-label">Project Name:</label>
        <input type="text" id="name" v-model="name" class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="description" class="cyber-label">Description:</label>
        <textarea id="description" v-model="description" class="cyber-form-input"></textarea>
      </div>
      <div class="cyber-form-group">
        <label for="githubLink" class="cyber-label">GitHub Link:</label>
        <input type="text" id="githubLink" v-model="githubLink" class="cyber-form-input" />
      </div>
      <div class="cyber-form-group">
        <label for="tools" class="cyber-label">Tools (comma-separated):</label>
        <input
          type="text"
          id="tools"
          v-model="toolsInput"
          class="cyber-form-input"
          @blur="parseTools"
        />
      </div>
      <div class="cyber-form-group">
        <label for="image" class="cyber-label">Image:</label>
        <input type="file" id="image" @change="handleImageUpload" class="cyber-form-input" />
        <img v-if="image" :src="image" alt="Project Image Preview" class="cyber-image-preview" />
      </div>
      <div class="cyber-form-actions">
        <button @click="updateProject" class="cyber-submit-button">Save</button>
        <button @click="editmode = false" class="cyber-cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  db
} from '@/firebase';

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  arrayRemove,
  arrayUnion
} from 'firebase/firestore';
import {
  getAuth
} from 'firebase/auth';


export default {
  props: ['projectId','isOwner'],

  data() {
    return {
      project: {
        name: '',
        description: '',
        githubLink: '',
        tools: [],
        created: null,
        image: '',
      },
      name:"",
      description:"",
      githubLink: "",
      image: "",
      tools: [],
      toolsInput: '',
      editmode: false,
    };
  },

  mounted() {
    console.log(this.isOwner)
    if (this.projectId) {
      this.fetchProject();
    }
    console.log('Project ID:', this.project);
  },

  watch: {
    projectId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.fetchProject();
      }
    },
  },

  methods: {
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    parseTools() {
      this.tools = this.toolsInput.split(',').map(t => t.trim()).filter(Boolean);
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          this.image = e.target.result; // base64
        };
        reader.readAsDataURL(file);
      }
    },

    async fetchProject() {
      try {
        const ref = doc(db, 'projects', this.projectId);
        const snap = await getDoc(ref);
        console.log(snap.data());
        if (snap.exists()) {
          const data = snap.data();
          this.project = data;
          this.toolsInput = this.project.tools.join(', ');
          this.name = this.project.name;
          this.description = this.project.description;
          this.tools = this.project.tools;
          this.githubLink = this.project.githubLink;
          this.image = this.project.image;

        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    },

    async updateProject() {
  try {
    // First parse tools from the input string
    this.tools = this.toolsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    // Prepare the update data
    const updateData = {
      name: this.name,
      description: this.description,
      githubLink: this.githubLink,
      tools: this.tools,
      image: this.image,
      created: this.project.created || serverTimestamp(),
    };

    // Update Firestore
    const ref = doc(db, 'projects', this.projectId);
    await updateDoc(ref, updateData);

    // Immediately update the local project object
    this.project = {
      ...this.project,
      ...updateData
    };

    // Add timeline entry
    const timeref = await addDoc(collection(db, 'timeline'), {
      ItemId: this.projectId,
      ItemType: 'project',
      Message: 'Project updated: ' + this.name, // Use current name instead of project.name
      timestamp: serverTimestamp(),
      type: 'update',
    });

    const currentUser = getAuth().currentUser;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      timeline: arrayUnion(timeref.id),
    });

    this.editmode = false;
    console.log('Project updated!');
    
    // Optional: Show success notification
    // this.$notify({ type: 'success', message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update failed:', error);
    // Optional: Show error notification
    // this.$notify({ type: 'error', message: 'Failed to update project' });
  }
  // Removed window.location.reload() - changes are now synchronized immediately
},

    async deleteProject(id) {
      try {
        const ref = doc(db, 'projects', id);
        await deleteDoc(ref);
        console.log('Project deleted');
        const timeref = await addDoc(collection(db, 'timeline'), {
          ItemId: id,
          ItemType: 'project',
          Message: 'Project deleted: ' + this.project.name,
          timestamp: serverTimestamp(),
          type: 'delete',
        });
        const currentUser = getAuth().currentUser;
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          projects: arrayRemove(id),
          timeline: arrayUnion(timeref.id),
        });
        // Emit event to parent if needed
        this.$emit('deleted', id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Individual Project Details */


.cyber-card {
  background: rgba(20, 20, 30, 0.7);
  position: relative;
  overflow: auto; /* Ensure content doesn't get clipped */
  padding: 1rem;

}

.cyber-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.cyber-card-title {
  color: white;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 1.8rem;
  margin: 0;
}

.cyber-card-actions {
  display: flex;
  gap: 1rem;
  z-index: 2; /* Ensure buttons are clickable */
}

.cyber-delete-btn,
.cyber-edit-btn {
  display: inline-flex;
  border: none;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
  z-index: 2; /* Ensure buttons are clickable */
}

.cyber-delete-btn {
  background: rgba(20, 20, 30, 0.0);
  color: #ff0000;
}


.cyber-edit-btn {
  background: rgba(20, 20, 30, 0.0);
  color: #009dff;
}



.cyber-btn-icon {
  font-size: 1.1rem;
}

.cyber-btn-text {
  position: relative;
}

.cyber-card-body {
  color: #eee;
  font-family: 'Roboto Mono', monospace;
  font-size: 1rem;
  line-height: 1.6;
  overflow: auto; /* Ensure content doesn't get clipped */
}

.cyber-label {
  font-weight: bold;
  color: #00a2ff;
  margin-right: 0.5rem;
}

.cyber-link {
  color: #00bfff;
  text-decoration: none;
}

.cyber-link:hover {
  text-decoration: underline;
}

.cyber-tag {
  background-color: rgba(0, 102, 255, 0.1);
  color: #00a2ff;
  border: 1px solid rgba(0, 102, 255, 0.3);
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.cyber-project-image {
  max-width: 100%; /* Make image responsive within its container */
  max-height: 300px; /* Set a maximum height if needed */
  height: auto;
  margin-top: 1rem;
  border: 1px solid #0066ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.2);
  display: block; /* Prevent extra space below inline elements */
}

/* Edit Form Styles */
.cyber-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.cyber-form-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.cyber-form-group {
  display: flex;
  flex-direction: column;
}

.cyber-form-label {
  color: #eee;
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-shadow: 0 0 3px rgba(0, 102, 255, 0.5);
}

input[type="text"], textarea {
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

input[type="text"]:focus, textarea:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.3);
  background: rgba(30, 30, 50, 0.9);
}

.cyber-form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
  z-index: 2; /* Ensure buttons are clickable */
}

.cyber-submit-button,
.cyber-cancel-button {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 0;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
  z-index: 2; /* Ensure buttons are clickable */
}

.cyber-submit-button {
  background-color: rgba(0, 102, 255, 0.2);
  color: #00a2ff;
  border: 1px solid #0066ff;
}

.cyber-submit-button:hover {
  background-color: rgba(0, 102, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 102, 255, 0.5);
}

.cyber-cancel-button {
  background-color: rgba(50, 50, 50, 0.7);
  color: #eee;
  border: 1px solid #777;
}

.cyber-cancel-button:hover {
  background-color: rgba(70, 70, 70, 0.9);
  box-shadow: 0 0 8px rgba(100, 100, 100, 0.5);
}

.cyber-image-preview {
  max-width: 200px;
  height: auto;
  margin-top: 0.5rem;
  border: 1px solid #555;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  display: block; /* Prevent extra space below inline elements */
}

/* Styles for the card container in gallery mode to show all content */
.cyber-view-gallery .cyber-card-container {
  display: flex;
  flex-direction: column;
}

.cyber-view-gallery .cyber-card-container .cyber-card {
  height: auto; /* Allow the card to take the necessary height */
  overflow: auto; /* Allow scrolling if content is too long */
}

/* Remove hover transform */
.cyber-view-list .cyber-card-container:hover,
.cyber-view-gallery .cyber-card-container:hover {
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.5);
  /* transform: translateY(-5px) scale(1.02); */ /* Removed */
  border-color: #00a2ff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-project-details {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .cyber-card {
    padding: 1.5rem;
  }

  .cyber-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
  }

  .cyber-card-actions {
    margin-top: 1rem;
    gap: 0.8rem;
  }

  .cyber-card-title {
    font-size: 1.5rem;
  }

  .cyber-delete-btn,
  .cyber-edit-btn,
  .cyber-submit-button,
  .cyber-cancel-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }

  .cyber-label {
    margin-right: 0.3rem;
  }

  .cyber-tag {
    margin-right: 0.3rem;
    font-size: 0.8rem;
  }

  .cyber-form-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
}

/* Animations */
@keyframes cyber-glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes cyber-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 102, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 102, 255, 0);
  }
}

/* Remove the glitch animation on the card container */
/* .cyber-add-btn:hover,
.cyber-card-container:hover {
  animation: cyber-glitch 0.5s linear infinite;
} */
</style>