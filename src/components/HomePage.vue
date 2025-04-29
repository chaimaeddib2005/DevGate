<template>
  <div class="container">
    <!-- Developer Animation Background Elements -->
    <div class="developer-animation"></div>
    <div class="code-rain">
      <canvas ref="canvas"></canvas>

    </div>
    <aside class="profile">
      <img :src="userData.photoURL || defaultImage" alt="profile" class="profile-img" />
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
      <p>LinkedIn : {{ userData.linkedin }}</p> 
      <p>description : {{ userData.description }}</p>
      
      <button @click="goToEditProfile" class="btn edit-btn">Éditer Profil</button>

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
          <div class="floating-developer"></div>
          <h1 class="platform-title">DEV<span>HUB</span></h1>
        </div>
        <div class="platform-description">
          <p>Welcome to our platform where you can manage and track your objectives and projects.</p>
        </div>
      </div>
      
      <div class="top-bar">
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
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, onUnmounted} from 'vue'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '../firebase'
  
  const router = useRouter()
  const userData = ref({})
  const canvas = ref(null) // This should be at the top with other refs

  const defaultImage = 'https://via.placeholder.com/150'
  
  const navItems = [
  { title: 'Compétences', route: '/Competences', icon: 'fas fa-tools', description: 'Gérez vos compétences.' },
  { title: 'Projets', route: '/projects', icon: 'fas fa-rocket', description: 'Partagez vos projets.' },
  { title: 'Activité', route: '/timeline', icon: 'fas fa-chart-line', description: 'Suivez votre activité.' },
  { title: 'Objectifs', route: '/objectifs', icon: 'fas fa-bullseye', description: 'Atteignez vos objectifs.' },
  {title:'Visualization',route:'/visualize',icon:'fas fa-eye',description:'visualize you progress'}
]


let animationInterval = null;

// Matrix rain variables
let matrixCtx = null;
let matrixDrops = [];
let matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()";
const matrixFontSize = 14;

// Draw function (moved to root)
function drawMatrixRain() {
  // Semi-transparent black overlay for trailing effect
  matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  matrixCtx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  
  // Bright green text
  matrixCtx.fillStyle = '#0f0';
  matrixCtx.font = '${matrixFontSize}px monospace';
  
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
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
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
     router.push('/followings')
  }

  function goToFollowers() {
     router.push('/followers')
  }

  
  onMounted(async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        userData.value = userSnap.data()
      }
    }
  })
  </script>
  
  <style scoped>
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
/* Ensure content has a transparent background */
.content, .profile {
  position: relative; /* Ensures content stays above the rain */
  z-index: 1;
}

/* Developer Animation (Floating behind content) */
.developer-animation {
  position: absolute;
  width: 300px;
  height: 300px;
  right: 10%;
  top: 30%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100 30L70 70H50V130H70L100 170L130 130H150V70H130L100 30Z" fill="%23a8d08d" opacity="0.1"/><circle cx="100" cy="100" r="60" fill="none" stroke="%23a8d08d" stroke-width="2" opacity="0.3"/><path d="M80 90L70 100L80 110M120 90L130 100L120 110" stroke="%23a8d08d" stroke-width="2" fill="none"/><rect x="85" y="130" width="30" height="10" rx="2" fill="%23a8d08d" opacity="0.5"/></svg>');
  background-repeat: repeat;
  animation: float 8s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(94, 255, 0, 0.5));
  z-index: 0;
  color: white;
}




/* Platform Header Styling */
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
  width: 80px;
  height: 80px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="20" fill="%2300ff00" opacity="0.8"/><rect x="30" y="65" width="40" height="30" fill="%2300ff00" opacity="0.6"/><rect x="35" y="70" width="10" height="15" fill="%23000000"/><rect x="55" y="70" width="10" height="15" fill="%23000000"/></svg>');
  animation: float-small 6s ease-in-out infinite;
}

.platform-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 10px #39ff14 ;
}

.platform-title span {
  color: #39ff14 ;
}

.platform-description {
  max-width: 600px;
  text-align: center;
  padding: 15px;
  background: rgba(20, 20, 30, 0.7);
  border-left: 3px solid #39ff14;
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

@keyframes matrix {
  from { background-position: 0 0; }
  to { background-position: 0 100px; }
}
  
  /* Profile Sidebar - Arcade Cabinet Inspired */
  .profile {
    width: 280px;
    background: rgba(17, 17, 17, 0.5);;
    padding: 30px;
    text-align: center;
    border-right: 1px solid #39ff14;
    box-shadow: 0 0 20px #236917;
    position: relative;
  }
  
  .profile::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #39ff14, #bcff14);
  }
  
  .profile-img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 0;
    border: 3px solid #39ff14;
    box-shadow: 0 0 15px #2fbf16;
    filter: contrast(1.1) saturate(1.1);
    margin-bottom: 20px;
  }
  
  .profile h2 {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 10px #2fbf16;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  
  .user-email {
    color: #aaa;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .user-link span {
    color: #39ff14;
    font-weight: 600;
  }
  
  .user-desc {
    background: rgba(20, 20, 20, 0.8);
    border-left: 3px solid #39ff14;
    padding: 15px;
    margin: 20px 0;
    font-size: 14px;
    line-height: 1.5;
    text-align: left;
  }
  
  /* Buttons - Arcade Style */
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
    background: #39ff14;
    color: white;
    padding: 10px 20px;
    border-radius: 0;
    margin-top: 15px;
    box-shadow: 0 5px 0 #26b80c;
    position: relative;
    overflow: hidden;
  }
  
  .edit-btn:hover {
    transform: translateY(2px);
    box-shadow: 0 3px 0 #2ac50f;
  }
  
  .edit-btn:active {
    transform: translateY(5px);
    box-shadow: none;
  }
  
  /* Follow Section - Digital Display */
  .follows {
    margin-top: 30px;
    border-top: 1px solid #333;
    padding-top: 20px;
  }
  
  .follow-item {
    display: inline-block;
    margin: 0 15px;
    font-weight: 600;
    color: #39ff14;
    cursor: pointer;
    position: relative;
  }
  
  .follow-item:hover {
    text-shadow: 0 0 8px #34ad1e;
  }
  
  .follow-number {
    color: #fff;
    font-size: 18px;
  }
  
  /* Main Content - Cyberpunk UI */
  .content {
  flex: 1;
  padding: 40px;
  background: rgba(10, 10, 10, 0.5); /* Changed from 0.7 to 0.5 opacity */
}
  
  .top-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
  }
  
  .discover-btn {
    background: transparent;
    color: #39ff14;
    padding: 10px 25px;
    border: 2px solid #39ff14;
    border-radius: 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;
  }
  
  .discover-btn:hover {
    background: #174310;
    text-shadow: 0 0 10px #39ff14;
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
      #1a4712,
      transparent
    );
    transition: 0.5s;
  }
  
  .discover-btn:hover::before {
    left: 100%;
  }
  
  /* Blocks - Glowing Tech Panels */
  .blocks {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  .block {
    background: rgba(20, 20, 20, 0.6);
    padding: 30px;
    border: 1px solid #333;
    border-top: 3px solid #39ff14;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  
  .block:hover {
    border-color: #39ff14;
    box-shadow: 0 0 20px #2b9817;
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
        #0d2608 50%,
        transparent 52%
      );
    background-size: 5px 5px;
    opacity: 0.5;
  }
  
  .block-icon {
    font-size: 40px;
    margin-bottom: 15px;
    color: #39ff14;
    text-shadow: 0 0 10px #2b7e1c;
  }
  
  .block h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #fff;
  }
  
  .block p {
    font-size: 14px;
    color: #aaa;
    line-height: 1.5;
  }
  
  /* Glitch Effect on Hover */
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