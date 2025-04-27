<template>
    <div v-if="projectId">
      <div v-if="!editmode" class="project-card">
        <button @click="deleteProject(projectId)">
          <i data-eva="trash-2-outline"></i>
        </button>
        <button @click="editmode = !editmode">
          <i data-eva="edit-outline"></i>
        </button>
  
        <h2>{{ project.name }}</h2>
        <p>Description: {{ project.description }}</p>
        <p>GitHub: <a :href="project.githubLink" target="_blank">{{ project.githubLink }}</a></p>
        <p>Tools: {{ project.tools.join(', ') }}</p>
        <p>Created: {{ formatDate(project.created) }}</p>
        <img v-if="project.image" :src="project.image" alt="Project Image" style="max-width: 300px; max-height: 200px;" />
      </div>
  
      <div v-else>
        <input type="text" v-model="project.name" placeholder="Project Name" />
        <textarea v-model="project.description" placeholder="Description"></textarea>
        <input type="text" v-model="project.githubLink" placeholder="GitHub Link" />
        <input type="text" v-model="toolsInput" placeholder="Comma-separated tools" @blur="parseTools" />
        <input type="file" @change="handleImageUpload" />
        <button @click="updateProject">Save</button>
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
    serverTimestamp,} from 'firebase/firestore';

  
  export default {
    props: ['projectId'],
  
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
        toolsInput: '',
        editmode: false,
      };
    },
  
    mounted() {
      if (this.projectId) {
        this.fetchProject();
      }
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
        this.project.tools = this.toolsInput.split(',').map(t => t.trim()).filter(Boolean);
      },
  
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            this.project.image = e.target.result; // base64
          };
          reader.readAsDataURL(file);
        }
      },
  
      async fetchProject() {
        try {
          const ref = doc(db, 'projects', this.projectId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            this.project = data.project;
            this.toolsInput = this.project.tools.join(', ');
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      },
  
      async updateProject() {
        try {
          const ref = doc(db, 'projects', this.projectId);
          await updateDoc(ref, {
            project: {
              ...this.project,
              tools: this.project.tools,
              created: this.project.created || serverTimestamp(),
            },
          });
  
          await addDoc(collection(db, 'timeline'), {
            ItemId: this.projectId,
            ItemType: 'project',
            Message: 'Project updated: ' + this.project.name,
            timestamp: serverTimestamp(),
            type: 'update',
          });
  
          this.editmode = false;
          console.log('Project updated!');
        } catch (error) {
          console.error('Update failed:', error);
        }
      },
  
      async deleteProject(id) {
        try {
          const ref = doc(db, 'projects', id);
          await deleteDoc(ref);
          console.log('Project deleted');
  
          // Emit event to parent if needed
          this.$emit('deleted', id);
        } catch (error) {
          console.error('Delete failed:', error);
        }
      },
    },
  };
  </script>
  