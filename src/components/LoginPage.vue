<template>
  <div class="container">
    <!-- Code Rain Background -->
    <div class="code-rain">
      <canvas ref="canvas"></canvas>
    </div>

    <!-- Login Card -->
    <div class="login-container">
      <div class="login-card">
        <div class="platform-logo">
          <div class="floating-developer"></div>
          <h1 class="platform-title">DEV<span>HUB</span></h1>
        </div>
        
        <h2>Login</h2>
        <p class="platform-description">Welcome back to the developer community</p>

        <form @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="Email" />
          <input v-model="password" type="password" placeholder="Password" />
          <button type="submit" class="btn login-btn">Login</button>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p class="register-link">
            Not registered yet?
            <router-link to="/register">Create an account</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { login } from '@/composables/AuthService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const canvas = ref(null)

// Matrix rain variables
let matrixCtx = null;
let matrixDrops = [];
let matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()";
const matrixFontSize = 14;

function drawMatrixRain() {
  matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  matrixCtx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  
  matrixCtx.fillStyle = '#0066ff';
  matrixCtx.font = `${matrixFontSize}px monospace`;
  
  for (let i = 0; i < matrixDrops.length; i++) {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * matrixFontSize;
    const y = matrixDrops[i] * matrixFontSize;
    
    matrixCtx.fillText(char, x, y);
    
    if (y > canvas.value.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  }
}

function handleMatrixResize() {
  if (!canvas.value) return;
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
  const columns = Math.floor(canvas.value.width / matrixFontSize);
  matrixDrops = Array(columns).fill(0).map(() => Math.random() * -100);
}

onMounted(() => {
  if (canvas.value) {
    matrixCtx = canvas.value.getContext('2d');
    handleMatrixResize();
    window.addEventListener('resize', handleMatrixResize);
    const animationInterval = setInterval(drawMatrixRain, 33);
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleMatrixResize);
      clearInterval(animationInterval);
    });
  }
});

const handleLogin = async () => {
  error.value = '';

  try {
    await login(email.value, password.value);
    router.push('/home');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      error.value = "No account found with this email.";
    } else if (err.code === 'auth/wrong-password') {
      error.value = "Incorrect password.";
    } else if (err.code === 'auth/invalid-email') {
      error.value = "Invalid email address.";
    } else {
      error.value = err.message;
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e0e0e0;
  font-family: 'Rajdhani', 'Courier New', monospace;
  background-color: rgba(10, 10, 18, 0.3);
}

.code-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  background: rgba(17, 17, 17, 0.8);
  padding: 40px;
  border-radius: 0;
  border: 1px solid #0066ff;
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.5);
  max-width: 500px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(5px);
}

.platform-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.floating-developer {
  width: 50px;
  height: 50px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="20" fill="%2300a2ff" opacity="0.8"/><rect x="30" y="65" width="40" height="30" fill="%2300a2ff" opacity="0.6"/><rect x="35" y="70" width="10" height="15" fill="%23000000"/><rect x="55" y="70" width="10" height="15" fill="%23000000"/></svg>');
  animation: float-small 6s ease-in-out infinite;
}

.platform-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.platform-title span {
  color: #00a2ff;
}

.platform-description {
  margin-bottom: 30px;
  color: #aaa;
  font-size: 1rem;
}

.login-card h2 {
  margin-bottom: 20px;
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.login-card form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.login-card input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(20, 20, 30, 0.7);
  border: 1px solid #333;
  border-left: 3px solid #0066ff;
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  transition: all 0.3s;
}

.login-card input:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
}

.btn {
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-btn {
  background: #0066ff;
  color: white;
  padding: 12px 20px;
  border-radius: 0;
  margin-top: 10px;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 0 #0044cc;
}

.login-btn:hover {
  background: #0055e6;
  transform: translateY(2px);
  box-shadow: 0 3px 0 #0044cc;
}

.login-btn:active {
  transform: translateY(5px);
  box-shadow: none;
}

.login-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.error-message {
  color: #ff4d4d;
  margin: 10px 0;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.register-link {
  margin-top: 20px;
  color: #aaa;
}

.register-link a {
  color: #00a2ff;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-shadow: 0 0 8px rgba(0, 102, 255, 0.7);
  text-decoration: underline;
}

@keyframes float-small {
  0%, 100% { transform: translateY(-10px); }
  50% { transform: translateY(10px); }
}
</style>