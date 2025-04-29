<template>
  <div class="cyber-timeline-container">
    <div class="cyber-controls">
      <router-link to="/home" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    </div>
    <h2 class="cyber-timeline-title">Timeline</h2>

    <div class="cyber-filter">
      <label for="typeFilter" class="cyber-label">Filter by type:</label>
      <select id="typeFilter" v-model="selectedFilter" class="cyber-select">
        <option value="">All</option>
        <option value="add">Add</option>
        <option value="delete">Delete</option>
        <option value="update">Update</option>
      </select>
    </div>

    <div v-if="!userReady" class="cyber-loading-message">
      Loading events...
    </div>
    <div v-else-if="filteredEvents.length === 0 && userReady" class="cyber-no-events-message">
      No events to display.
    </div>
    <div v-else class="cyber-event-list">
      <div v-for="event in filteredEvents" :key="event.id" class="cyber-event-card">
        <div class="cyber-event-info">
          <strong class="cyber-event-message">{{ event.message }}</strong><br />
          <span class="cyber-event-timestamp">
            {{ event.timestamp ? event.timestamp.toLocaleString() : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  data() {
    return {
      events: [],
      userReady: false,
      selectedFilter: '', // for filtering by type
    };
  },

  computed: {
    filteredEvents() {
      if (!this.selectedFilter || this.selectedFilter === 'all') {
        return this.events;
      }
      return this.events.filter(event => event.type === this.selectedFilter);
    }
  },

  async mounted() {
    this.fetchEvents();
  },

  async created() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.fetchEvents(user.uid);
        this.userReady = true;
      }
    });
  },

  methods: {
    async fetchEvents() {
      try {
        const userId = getAuth().currentUser.uid;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log('User document does not exist');
          return;
        }

        const userData = userSnap.data();
        const timelineIds = userData.timeline || [];

        if (timelineIds.length === 0) {
          console.log('No timeline events found for this user');
          return;
        }

        const eventsArray = [];

        for (const timelineId of timelineIds) {
          const timelineDocRef = doc(db, 'timeline', timelineId);
          const timelineSnap = await getDoc(timelineDocRef);

          if (timelineSnap.exists()) {
            const eventData = timelineSnap.data();

            eventsArray.push({
              id: timelineSnap.id,
              itemId: eventData.itemId || '',
              itemType: eventData.itemType || '',
              message: eventData.Message || '',
              timestamp: eventData.timestamp?.toDate() || null,
              type: eventData.type || '',
            });
          }
        }

        eventsArray.sort((a, b) => b.timestamp - a.timestamp);
        this.events = eventsArray.slice(0, 10);

      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Cyber/Developer Theme Styles for Timeline */
.cyber-timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(10, 10, 20, 0.7);
  border: 1px solid rgba(0, 102, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.1);
}

.cyber-controls {
  display: flex;
  margin-bottom: 2rem;
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

.cyber-timeline-title {
  color: #00a2ff;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cyber-label {
  color: #eee;
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
  font-size: 0.9rem;
}

.cyber-select {
  padding: 0.8rem;
  border: 1px solid #0066ff;
  border-radius: 0;
  background-color: rgba(20, 20, 30, 0.8);
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

.cyber-select:focus {
  outline: none;
  border-color: #00a2ff;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
}

.cyber-event-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cyber-event-card {
  padding: 1.5rem;
  background: rgba(20, 20, 30, 0.9);
  border: 1px solid #0066ff;
  border-radius: 0;
  box-shadow: 0 0 10px rgba(0, 102, 255, 0.3);
  transition: all 0.3s ease;
}

.cyber-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 102, 255, 0.5);
}

.cyber-event-info {
  color: #eee;
  font-size: 1rem;
  line-height: 1.6;
}

.cyber-event-message {
  color: #00a2ff;
  font-weight: bold;
  font-family: 'Roboto Mono', monospace;
}

.cyber-event-timestamp {
  color: #aaa;
  font-size: 0.9rem;
  font-family: 'Roboto Mono', monospace;
}

.cyber-loading-message,
.cyber-no-events-message {
  color: #eee;
  text-align: center;
  margin-top: 2rem;
  font-size: 1.2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cyber-timeline-container {
    padding: 1.5rem;
  }

  .cyber-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .cyber-event-list {
    gap: 1rem;
  }

  .cyber-event-card {
    padding: 1rem;
  }
}
</style>