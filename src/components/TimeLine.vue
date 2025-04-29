<template>
    <div class="events">
    <h2 class="title">TimeLine</h2>
    <div
      v-for="event in events"
      :key="event.id"
      class="event"
    >
      <div class="eventInfo">
        <strong>{{ event.type }}</strong><br>
        <strong>{{ event.message }}</strong><br>
        <strong>{{ event.timestamp ? event.timestamp.toLocaleString() : '' }}</strong>
      </div>
    </div>
  </div>
</template>
<script>
import{db} from '../firebase'
import {doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
export default {
    data(){
        return {
            events: [],
            userReady: false,
        };
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
    const userId = getAuth().currentUser.uid; // Get the current user's ID
    
    // 1. Get the user document to retrieve the timeline IDs
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('User document does not exist');
      return;
    }
    
    const userData = userSnap.data();
    const timelineIds = userData.timeline || []; // Get the array of timeline IDs

    if (timelineIds.length === 0) {
      console.log('No timeline events found for this user');
      return;
    }

    // 2. Fetch events from the timeline collection using the IDs
    const eventsArray = [];
    
    // Fetch each timeline document by ID
    for (const timelineId of timelineIds) {
      const timelineDocRef = doc(db, 'timeline', timelineId);
      const timelineSnap = await getDoc(timelineDocRef);
      
      if (timelineSnap.exists()) {
        const eventData = timelineSnap.data();
        
        eventsArray.push({
          id: timelineSnap.id,
          itemId: eventData.itemId || '',
          itemType: eventData.itemType || '',
          message: eventData.message || '',
          timestamp: eventData.timestamp?.toDate() || null,
          type: eventData.type || '',
        });
      }
    }

    // 3. Sort events by timestamp (descending) and limit to 10
    eventsArray.sort((a, b) => b.timestamp - a.timestamp); // Sort in descending order
    
    this.events = eventsArray.slice(0, 10); // Limit to 10 most recent events

  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
}

}

}
</script>