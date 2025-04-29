<template>
    <div v-if="projectId">
      <div v-if="!editmode" class="project-card">
        <button @click="deleteProject(projectId)">
          Delete
        </button>
        <button @click="editmode = !editmode">
          Edit
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
    serverTimestamp,
    arrayRemove,
    arrayUnion}  from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
   

  
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
          console.log(snap.data());
          if (snap.exists()) {
            const data = snap.data();
            this.project = data;
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
  
          const timeref = await addDoc(collection(db, 'timeline'), {
            ItemId: this.projectId,
            ItemType: 'project',
            Message: 'Project updated: ' + this.project.name,
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
        } catch (error) {
          console.error('Update failed:', error);
        }
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
  