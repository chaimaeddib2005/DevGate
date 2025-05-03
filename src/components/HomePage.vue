<template>
  <div class="container">
    
    <!-- Developer Animation Background Elements -->
    <div class="code-rain">
      <canvas ref="canvas"></canvas>

    </div>
    <aside class="profile">
      <router-link to="/discover" class="btn back-btn" v-if="!isanOwner" >
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
      <img :src="userData.photoURL || defaultImage" alt="profile" class="profile-img" />
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
      <p>LinkedIn : <a>{{ userData.linkedin }}</a></p> 
      <p>description : {{ userData.description }}</p>
      
      <button @click="goToEditProfile" v-if="isanOwner" class="btn edit-btn">Edit Profil</button>
      <button @click="showTimeModal = true" v-if="isanOwner" class="btn time-btn">
        <i class="fas fa-clock"></i> Log Coding Time
      </button>
      <div class="follows">
        <div @click="goToFollowings" class="follow-item">
          <span class="follow-number">{{ userData.followings?.length || 0 }}</span> Followings
        </div>
        <div @click="goToFollowers" class="follow-item">
          <span class="follow-number">{{ userData.followers?.length || 0 }}</span> Followers
        </div>
      </div>
    </aside>
  
    <!-- Right Side -->
    <div class="content">
      <div class="platform-header">
        <div class="platform-logo">
          <!-- Developer Avatar Floating Next to Logo -->
          <img src="/logo1.png" class="sloth-logo"  alt="DevHub Sloth">
          <h1 class="platform-title">DEV<span>HUB</span></h1>
        </div>
        <div class="platform-description">
          <p>Welcome to our platform where you can manage and track your objectives and projects.</p>
        </div>
      </div>
      
      <div class="top-bar" v-if="isanOwner">
        <button @click="goToDiscover" class="btn discover-btn">Discover</button>
      </div>
  
      <div class="blocks">
        <div class="block" v-for="item in navItems" :key="item.title" @click="navigateTo(item.route)">
          <div class="block-icon">
            <i :class="item.icon"></i>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
    <div v-if="showTimeModal" class="modal-overlay" @click.self="showTimeModal = false">
    <div class="modal-content">
      <h3>Log Your Coding Time</h3>
      <div class="time-input">
        <label for="hours">Hours:</label>
        <input type="number" id="hours" v-model.number="hours" min="0" max="24" placeholder="0">
        
        <label for="minutes">Minutes:</label>
        <input type="number" id="minutes" v-model.number="minutes" min="0" max="59" placeholder="0">
      </div>
      
      <!-- Validation Error Message -->
      <div v-if="validationError" class="validation-error">
        {{ validationError }}
      </div>
      
      <div class="modal-actions">
        <button @click="logCodingTime" class="btn submit-btn">Submit</button>
        <button @click="showTimeModal = false" class="btn cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, onUnmounted} from 'vue'
  import { useRouter,useRoute } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
  import { db } from '../firebase'
  
  const route = useRoute()
  const router = useRouter()
  const userData = ref({})
  const canvas = ref(null) // This should be at the top with other refs
  const showTimeModal = ref(false)
  const hours = ref(0)
  const minutes = ref(0)
  const validationError = ref('');

  const defaultImage = 'https://via.placeholder.com/150'
  const userId = route.params.userId
  const navItems = [
  { title: 'Compétences', route: '/Competences/'+userId, icon: 'fas fa-tools', description: 'Gérez vos compétences.' },
  { title: 'Projets', route: '/projects/'+userId, icon: 'fas fa-rocket', description: 'Partagez vos projets.' },
  { title: 'Activité', route: '/timeline/'+userId, icon: 'fas fa-chart-line', description: 'Suivez votre activité.' },
  { title: 'Objectifs', route: '/objectifs/'+userId, icon: 'fas fa-bullseye', description: 'Atteignez vos objectifs.' },
  {title:'Visualization',route:'/visualize/'+userId,icon:'fas fa-eye',description:'visualize you progress'}
]


let animationInterval = null;
const isanOwner = ref(false);
// Matrix rain variables
let matrixCtx = null;
let matrixDrops = [];
let matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()";
const matrixFontSize = 14;
const curentUserId = getAuth().currentUser.uid;
console.log(curentUserId);
async function logCodingTime() {
  // Reset validation error
  validationError.value = '';
  
  // Validate input
  const hoursNum = parseInt(hours.value);
  const minsNum = parseInt(minutes.value);
  
  if (isNaN(hoursNum) || isNaN(minsNum)) {
    validationError.value = 'Please enter valid numbers';
    return;
  }
  
  if (hoursNum < 0 || minsNum < 0) {
    validationError.value = 'Values cannot be negative';
    return;
  }
  
  if (minsNum > 59) {
    validationError.value = 'Minutes must be between 0-59';
    return;
  }
  
  if (hoursNum === 0 && minsNum === 0) {
    validationError.value = 'Please enter some time (cannot be 0:00)';
    return;
  }

  try {
    // Format the value string
    const timeValue = `${hoursNum}:${minsNum.toString().padStart(2, '0')}`;
    
    // Get references
    const userId = getAuth().currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const codingTimeRef = collection(userRef, 'codingTime');
    
    // Add new document to subcollection
    await addDoc(codingTimeRef, {
      valeur: timeValue,
      timestamp: serverTimestamp()
    });
    
    // Reset and close
    hours.value = 0;
    minutes.value = 0;
    showTimeModal.value = false;
    
  } catch (error) {
    validationError.value = 'Failed to log coding time. Please try again.';
    console.error('Error logging coding time:', error);
  }
}
// Draw function (moved to root)
function drawMatrixRain() {
  // Semi-transparent black overlay for trailing effect
  matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  matrixCtx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  
  // Bright green text
  matrixCtx.fillStyle = '#0066ff';
  matrixCtx.font =`${matrixFontSize}px monospace`;
  
  // Draw characters
  for (let i = 0; i < matrixDrops.length; i++) {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * matrixFontSize;
    const y = matrixDrops[i] * matrixFontSize;
    
    matrixCtx.fillText(char, x, y);
    
    // Reset drop if it reaches bottom with random chance
    if (y > canvas.value.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  }
}

// Resize handler (moved to root)
function handleMatrixResize() {
  if (!canvas.value) return;
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
  // Reinitialize drops when resizing
  const columns = Math.floor(canvas.value.width / matrixFontSize);
  matrixDrops = Array(columns).fill(0).map(() => Math.random() * -100);
}

onMounted(async () => {
  // Load user data
  const Cuuser = getAuth().currentUser
  isanOwner.value = Cuuser && Cuuser.uid === route.params.userId
 
  console.log(isanOwner);
  console.log(route.params.userId)
  const userId = route.params.userId
  
  if (userId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      userData.value = userSnap.data();
    }
  }

  // Matrix Rain Effect
  if (canvas.value) {
    matrixCtx = canvas.value.getContext('2d');
    handleMatrixResize(); // Initial setup
    
    window.addEventListener('resize', handleMatrixResize);
    animationInterval = setInterval(drawMatrixRain, 33);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleMatrixResize);
  if (animationInterval) clearInterval(animationInterval);
});

  
  function goToEditProfile() {
    router.push('/edit-profile')
  }
  
  function goToDiscover() {
    router.push('/discover')
  }
  
  function navigateTo(route) {
    router.push(route)
  }

  function goToFollowings() {
     const userId = route.params.userId;
     router.push('/followings/'+userId)
  }

  function goToFollowers() {
    const userId = route.params.userId;
     router.push('/followers/'+userId)
  }

  </script>
  
  <style scoped>
  .sloth-logo {
  position: absolute;
  width: 170px;
  height: 170px;
  left: 28%;
  filter: drop-shadow(0 0 10px rgba(0, 102, 255, 0.7));
  z-index: 0;
}
  .validation-error {
  color: #ff4444;
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 0, 0, 0.1);
  border-left: 3px solid #ff4444;
  text-align: center;
}

/* Make inputs display validation state */
input:invalid {
  border-color: #ff4444;
}
  .time-btn {
  background: #0066ff;
  color: white;
  padding: 10px 10px;
  border-radius: 0;
  margin-top: 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 5px 0 #0044cc;

}

.time-btn:hover {
  background: #0066ff;
  transform: translateY(2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(30, 30, 40, 0.95);
  padding: 30px;
  border-radius: 5px;
  border-top: 3px solid #0066ff;
  width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  color: #00a2ff;
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.time-input {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 15px;
  align-items: center;
  margin-bottom: 25px;
}

.time-input label {
  color: #e0e0e0;
  font-size: 18px;
}

.time-input input {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid #0066ff;
  color: white;
  padding: 10px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.submit-btn {
  background: #0066ff;
  color: white;
  padding: 10px 20px;
}

.submit-btn:hover {
  background: #0557d1;
}

.cancel-btn {
  background: #f44336;
  color: white;
  padding: 10px 20px;
}

.cancel-btn:hover {
  background: #d32f2f;
}
  .back-btn{
    display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  border-radius: 0;
}

.back-btn {
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
/* Base Container */
* {
  margin: 0; 
  padding: 0
}

@keyframes rain {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 200px;
  }
}

.container {
  min-height: 100vh;
  display: flex;
  color: #e0e0e0;
  font-family: 'Rajdhani', 'Courier New', monospace;
  overflow: hidden;
  background-color: rgba(10, 10, 18, 0.3);
  margin: 0;
}

.code-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.content, .profile {
  position: relative;
  z-index: 1;
}

/* Developer Animation */
.developer-animation {
  position: absolute;
  width: 300px;
  height: 300px;
  right: 10%;
  top: 30%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100 30L70 70H50V130H70L100 170L130 130H150V70H130L100 30Z" fill="%230066ff" opacity="0.1"/><circle cx="100" cy="100" r="60" fill="none" stroke="%230066ff" stroke-width="2" opacity="0.3"/><path d="M80 90L70 100L80 110M120 90L130 100L120 110" stroke="%230066ff" stroke-width="2" fill="none"/><rect x="85" y="130" width="30" height="10" rx="2" fill="%230066ff" opacity="0.5"/></svg>');
  background-repeat: repeat;
  animation: float 8s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(0, 102, 255, 0.5));
  z-index: 0;
  color: white;
}

/* Platform Header */
.platform-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}

.platform-logo {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.floating-developer {
  position: absolute;
  width: 280px;
  height: 280px;
  right: 10%;
  top: 30%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M120 80Q140 60 160 80L150 120Q130 140 110 120Z" fill="%231a1a2e" stroke="%230066ff" stroke-width="2"/><circle cx="130" cy="70" r="15" fill="%231a1a2e" stroke="%230066ff" stroke-width="1.5"/><circle cx="125" cy="65" r="3" fill="%230066ff"/><path d="M135 65L145 60" stroke="%230066ff" stroke-width="1.5" stroke-linecap="round"/><path d="M110 90L90 110" stroke="%230066ff" stroke-width="2" stroke-linecap="round"/><path d="M160 90L180 100" stroke="%230066ff" stroke-width="2" stroke-linecap="round"/><path d="M120 130L120 150" stroke="%230066ff" stroke-width="2" stroke-linecap="round"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0;
  animation: slow-blink 6s infinite;
}

.platform-title {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.platform-title span {
  color: #00a2ff;
}

.platform-description {
  max-width: 600px;
  text-align: center;
  padding: 15px;
  background: rgba(20, 20, 30, 0.7);
  border-left: 3px solid #0066ff;
  font-size: medium;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(-20px) rotate(-5deg); }
  50% { transform: translateY(20px) rotate(5deg); }
}

@keyframes float-small {
  0%, 100% { transform: translateY(-10px); }
  50% { transform: translateY(10px); }
}

/* Profile Sidebar */
.profile {
  width: 280px;
  background: rgba(17, 17, 17, 0.5);
  padding: 30px;
  text-align: center;
  border-right: 1px solid #0066ff;
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.3);
  position: relative;
}

.profile-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0;
  border: 3px solid #0066ff;
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.5);
  filter: contrast(1.1) saturate(1.1);
  margin-bottom: 20px;
}

.profile h2 {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.profile p {
  font-size: 20px;
}

.user-desc {
  background: rgba(20, 20, 20, 0.8);
  border-left: 3px solid #0066ff;
  padding: 15px;
  margin: 20px 0;
  font-size: 24px;
  line-height: 1.5;
  text-align: left;
}

/* Buttons */
.btn {
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
}

.edit-btn {
  background: #0066ff;
  color: white;
  padding: 10px 20px;
  border-radius: 0;
  margin-top: 15px;
  box-shadow: 0 5px 0 #0044cc;
  position: relative;
  overflow: hidden;
}

.edit-btn:hover {
  transform: translateY(2px);
  box-shadow: 0 3px 0 #0055e6;
}

.edit-btn:active {
  transform: translateY(5px);
  box-shadow: none;
}

/* Follow Section */
.follows {
  margin-top: 30px;
  border-top: 1px solid #333;
  padding-top: 20px;
}

.follow-item {
  display: inline-block;
  margin: 0 15px;
  font-weight: 600;
  color: #00a2ff;
  cursor: pointer;
  position: relative;
}

.follow-item:hover {
  text-shadow: 0 0 8px rgba(0, 102, 255, 0.7);
}

.follow-number {
  color: #fff;
  font-size: 18px;
}

/* Main Content */
.content {
  flex: 1;
  padding: 40px;
  background: rgba(10, 10, 10, 0.5);
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.discover-btn {
  background: transparent;
  color: #00a2ff;
  padding: 10px 25px;
  border: 2px solid #0066ff;
  border-radius: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
}

.discover-btn:hover {
  background: rgba(0, 102, 255, 0.1);
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.discover-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 102, 255, 0.3),
    transparent
  );
  transition: 0.5s;
}

.discover-btn:hover::before {
  left: 100%;
}

/* Blocks */
.blocks {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.block {
  background: rgba(20, 20, 20, 0.6);
  padding: 30px;
  border: 1px solid #333;
  border-top: 3px solid #0066ff;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.block:hover {
  border-color: #00a2ff;
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.4);
  transform: translateY(-5px);
}

.block::before {
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

.block-icon {
  font-size: 40px;
  margin-bottom: 15px;
  color: #00a2ff;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
}

.block h3 {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #fff;
}

.block p {
  font-size: 19px;
  color: #aaa;
  line-height: 1.5;
}

/* Glitch Effect */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.block:hover {
  animation: glitch 0.5s linear infinite;
}

  </style>