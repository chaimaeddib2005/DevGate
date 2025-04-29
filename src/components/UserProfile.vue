<template>
    <div class="pastel-reported-discussions" v-if="user">
        <router-link to="/home" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> Back
      </router-link>
      <h2 class="section-header">Profile Info</h2>
  
      <!-- Image Upload & Preview -->
      <div class="upload-box" @dragover.prevent @drop.prevent="onDrop">
        <input type="file" ref="fileInput" @change="onFileChange" hidden />
        <img
          :src="previewUrl || user.photoURL || defaultPhoto"
          alt="Profile Picture"
          class="avatar"
          @click="triggerFileInput"
        />
        <p class="upload-text">Click or drag image here to upload</p>
      </div>
  
      <div class="form-group">
        <label class="form-label"><strong>Name:</strong></label>
        <input v-model="editableUser.name" class="form-input" />
      </div>
  
      <div class="form-group">
        <label class="form-label"><strong>Email:</strong></label>
        <input v-model="editableUser.email" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label"><strong>LinkedIn:</strong></label>
        <input v-model="editableUser.linkedin" class="form-input" />
      </div>
  
      <button @click="saveProfileChanges" class="save-btn">
        <i class="fas fa-save"></i> Save Changes
      </button>
  
      <h3 class="subsection-header">Change Password</h3>
      <div class="form-group">
        <input type="password" v-model="currentPassword" placeholder="Current Password" class="form-input" />
      </div>
      <div class="form-group">
        <input type="password" v-model="newPassword" placeholder="New Password" class="form-input" />
      </div>
      <button @click="changePassword" class="password-btn">
        <i class="fas fa-key"></i> Update Password
      </button>
  
      <h3 class="subsection-header">Delete Account</h3>
      <button @click="deleteAccount" class="delete-btn">
        <i class="fas fa-trash-alt"></i> Delete My Account
      </button>
  
      <!-- Success/Error Messages -->
      <p v-if="success" ref="messageBox" class="message success">
        <i class="fas fa-check-circle"></i> {{ success }}
      </p>
      <p v-if="error" ref="messageBox" class="message error">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch, nextTick } from 'vue'
  import {
    getAuth,
    updatePassword,
    verifyBeforeUpdateEmail,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential
  } from 'firebase/auth'
  import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
  import { db } from '@/firebase'
  import { defineProps } from 'vue'
  
  const props = defineProps({ user: Object })
  
  const auth = getAuth()
  const userRef = doc(db, 'users', auth.currentUser.uid)
  
  const editableUser = reactive({
    name: '',
    email: ''
  })
  
  const previewUrl = ref('')
  const fileInput = ref(null)
  const defaultPhoto = '/default.png'
  const currentPassword = ref('')
  const newPassword = ref('')
  const success = ref('')
  const error = ref('')
  const messageBox = ref(null)
  
  watch(
    () => props.user,
    (val) => {
      if (val) {
        editableUser.name = val.name || ''
        editableUser.email = val.email || ''
        editableUser.linkedin = val.linkedin || ''
      }
    },
    { immediate: true }
  )
  
  const scrollToMessage = async () => {
    await nextTick()
    messageBox.value?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const showSuccess = async (msg) => {
    success.value = msg
    error.value = ''
    await scrollToMessage()
  }
  
  const showError = async (msg) => {
    error.value = msg
    success.value = ''
    await scrollToMessage()
  }
  
  const triggerFileInput = () => fileInput.value?.click()
  
  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) convertToBase64(file)
  }
  
  const onDrop = (e) => {
    const file = e.dataTransfer.files[0]
    if (file) convertToBase64(file)
  }
  
  const convertToBase64 = (file) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64Image = reader.result
      previewUrl.value = base64Image
      try {
        await updateDoc(userRef, { photoURL: base64Image })
        await showSuccess('Profile picture updated.')
      } catch (err) {
        await showError(err.message)
      }
    }
    reader.readAsDataURL(file)
  }
  
  const saveProfileChanges = async () => {
    const user = auth.currentUser
    try {
      await updateDoc(userRef, {
        name: editableUser.name
      })
  
      if (editableUser.email !== user.email) {
        await verifyBeforeUpdateEmail(user, editableUser.email, {
          url: window.location.origin
        })
  
        await showSuccess(
          'A verification email has been sent to your new email address. Please confirm it before logging in with the new email.'
        )
      } else {
        await showSuccess('Profile updated successfully.')
      }
    } catch (err) {
      await showError(err.message)
    }
  }
  
  const changePassword = async () => {
    try {
      const user = auth.currentUser
      const credential = EmailAuthProvider.credential(user.email, currentPassword.value)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword.value)
      await showSuccess('Password updated!')
    } catch (err) {
      await showError(err.message)
    }
  }
  
  const deleteAccount = async () => {
    try {
      if (!confirm('Are you sure you want to permanently delete your account?')) return
      await deleteDoc(userRef)
      await deleteUser(auth.currentUser)
      localStorage.removeItem('hasVisited')
      await showSuccess('Your account has been deleted. Redirecting...')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      await showError(err.message)
    }
  }
  </script>
  
  <style scoped>
/* Cyber/Developer Theme Styles */
.pastel-reported-discussions {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #e0e0e0;
  font-family: 'Rajdhani', 'Courier New', monospace;
  background: rgba(10, 10, 18, 0.3);
  position: relative;
  z-index: 1;
}

.section-header {
  color: #00a2ff;
  font-size: 2rem;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
  letter-spacing: 1px;
}

.section-header:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #0066ff, transparent);
  border-radius: 3px;
}

.subsection-header {
  color: #00a2ff;
  font-size: 1.5rem;
  margin: 2rem 0 1.5rem;
  position: relative;
  padding-bottom: 0.3rem;
  text-shadow: 0 0 8px rgba(0, 102, 255, 0.5);
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


.subsection-header:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 70px;
  height: 2px;
  background: linear-gradient(90deg, #0066ff, transparent);
  border-radius: 2px;
}

/* Upload box styling */
.upload-box {
  background: rgba(20, 20, 30, 0.7);
  border-radius: 0;
  padding: 2rem;
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.3);
  border: 1px solid #0066ff;
  text-align: center;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-box:hover {
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.5);
}

.upload-box::before {
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

.avatar {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 0;
  margin-bottom: 1rem;
  border: 3px solid #0066ff;
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.5);
  filter: contrast(1.1) saturate(1.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  filter: brightness(1.1) contrast(1.2) saturate(1.3);
}

.upload-text {
  color: #aaa;
  margin-top: 0.5rem;
  font-size: 1rem;
}

/* Form styling */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.8rem;
  color: #00a2ff;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 0;
  border: 1px solid #333;
  background: rgba(20, 20, 30, 0.8);
  color: #e0e0e0;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  border-left: 3px solid #0066ff;
}

.form-input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.3);
  background: rgba(30, 30, 40, 0.8);
}

/* Button styling */
.save-btn, .password-btn, .delete-btn {
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 0.8rem 1.5rem;
  border-radius: 0;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
}

.save-btn {
  background: #0066ff;
  color: white;
  box-shadow: 0 5px 0 #0044cc;
}

.save-btn:hover {
  transform: translateY(2px);
  box-shadow: 0 3px 0 #0055e6;
  background: #0077ff;
}

.password-btn {
  background: transparent;
  color: #00a2ff;
  border: 2px solid #0066ff;
}

.password-btn:hover {
  background: rgba(0, 102, 255, 0.1);
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.delete-btn {
  background: transparent;
  color: #ff3366;
  border: 2px solid #ff3366;
}

.delete-btn:hover {
  background: rgba(255, 51, 102, 0.1);
  text-shadow: 0 0 10px rgba(255, 51, 102, 0.7);
}

/* Message styling */
.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  border-left: 3px solid;
  background: rgba(20, 20, 30, 0.8);
}

.success {
  border-color: #00cc66;
  color: #00cc66;
}

.error {
  border-color: #ff3366;
  color: #ff3366;
}

/* Glitch effect on hover for buttons */
.save-btn:hover, .password-btn:hover, .delete-btn:hover {
  animation: glitch 0.5s linear infinite;
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@media (max-width: 600px) {
  .pastel-reported-discussions {
    padding: 1rem;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
  }
  
  .section-header {
    font-size: 1.5rem;
  }
  
  .subsection-header {
    font-size: 1.2rem;
  }
  
  .save-btn, .password-btn, .delete-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>