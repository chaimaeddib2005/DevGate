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
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
export default {
    data(){
        return {
            events: [],
            userReady: false,
        };
    },
    /*async created() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.fetchEvents(user.uid);
        this.userReady = true;
      }
    });
    },
    async created() {
      this.fetchEvents("ElqLIzH7MFhsSkB6AijK");
    },*/
    async created() {
      console.log("Database:", db);
    await this.fetchEvents(); 
    },
methods: {
  async fetchEvents() {
    const userId = "ElqLIzH7MFhsSkB6AijK"
    const timelineCollectionRef = collection(db, 'users', userId, 'timeline');
    const eventsQuery = query(
      timelineCollectionRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const eventsSnapshot = await getDocs(eventsQuery);

    const eventsArray = eventsSnapshot.docs.map((eventDoc) => {
      const eventData = eventDoc.data();

      return {
        id: eventDoc.id,
        itemId: eventData.itemId || '',
        itemType: eventData.itemType || '',
        message: eventData.message || '',
        timestamp: eventData.timestamp?.toDate() || null,
        type: eventData.type || '',
      };
    });

    this.events = eventsArray;
  }
}

}
</script>