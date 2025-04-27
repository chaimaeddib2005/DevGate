<template>
    <div class="add-project">
      <h2>Add New Project</h2>
      <form @submit.prevent="addProject">
        <div>
          <label for="name">Project Name</label>
          <input type="text" v-model="project.name" id="name" required />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea v-model="project.description" id="description" required></textarea>
        </div>
        <div>
          <label for="githubLink">GitHub Link</label>
          <input type="url" v-model="project.githubLink" id="githubLink" required />
        </div>
        <div>
          <label for="tools">Tools (comma separated)</label>
          <input type="text" v-model="toolsInput" id="tools" @blur="parseTools" required />
        </div>
        <div>
          <label for="image">Project Image</label>
          <input type="file" @change="handleImageUpload" id="image" />
        </div>
        <button type="submit">Save Project</button>
      </form>
    </div>
  </template>
  
  <script>
  import {db } from '@/firebase';
  import {collection,addDoc,serverTimestamp} from 'firebase/firestore'
  
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
        this.project.tools = this.toolsInput.split(',').map(t => t.trim()).filter(Boolean);
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
          await addDoc(collection(db, 'timeline'), {
            ItemId: projectRef.id,
            ItemType: 'project',
            Message: 'New project is added: ' + this.project.body,
            timestamp: serverTimestamp(),
            type: 'add',
          });
          this.$router.push({ name: 'ProjectsPage' }); // Redirect to project list or details page
        } catch (error) {
          console.error('Error adding project: ', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  