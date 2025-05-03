<template>
  <div class="visualization-container">
    <router-link :to="`/home/${userId}`" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> GO BACK
      </router-link>
    <div class="header">
      <h2>My Progress Dashboard</h2>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <h3>Total Skills</h3>
        <p class="stat-value">{{ totalSkills }}</p>
      </div>
      <div class="stat-card">
        <h3>Projects Completed</h3>
        <p class="stat-value">{{ completedProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Objectives Achieved</h3>
        <p class="stat-value">{{ completedObjectives }}</p>
      </div>
      <div class="stat-card">
        <h3>Weekly Coding Time</h3>
        <p class="stat-value" :title="codingTimeTooltip">{{ weeklyCodingAverage }}</p>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <h3>Skills Over Time</h3>
        <div class="chart-wrapper">
          <canvas ref="skillsChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="activity-heatmap">
          <h3>Activity Heatmap</h3>
          <div class="heatmap-grid">
            <div 
              v-for="(count, date) in heatmapData" 
              :key="date"
              class="heatmap-cell"
              :title="`${formatHeatmapDate(date)}: ${count} activity(ies)`"
              :style="{ backgroundColor: getHeatColor(count) }"
            ></div>
          </div>
          <div class="heatmap-legend">
            <span>Less</span>
            <div class="legend-color" style="background-color: #1a1a2e"></div>
            <div class="legend-color" style="background-color: #1e3a8a"></div>
            <div class="legend-color" style="background-color: #1e40af"></div>
            <div class="legend-color" style="background-color: #1d4ed8"></div>
            <div class="legend-color" style="background-color: #3b82f6"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <h3>Skill Distribution</h3>
        <div class="chat-wrapper">
          <canvas ref="skillDistributionChart"></canvas>

        </div>
      </div>
      <div class="chart-container">
        <h3>Objective Completion</h3>
        <div class="chat-wrapper">
          <canvas ref="objectivesChart"></canvas>

        </div>
      </div>
    </div>


  </div>
</template>
<script>
import { Chart, registerables } from 'chart.js';
import { db } from '../firebase';
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';

import { useRoute } from 'vue-router';

Chart.register(...registerables);

export default {
  data() {
    return {
      userId: "",
      timeRange: 'all',
      totalSkills: 0,
      completedProjects: 0,
      completedObjectives: 0,
      skillLevels: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      recentActivity: [],
      skillsChart: null,
      skillDistributionChart: null,
      objectivesChart: null,
      competences: [],
      projets: [],
      objectifs: [],
      heatmapData: {},
      weeklyCodingTime: [],
      codingTimeChart: null,
      weeklyCodingAverage: "0m",
      codingTimeTooltip: "Last 7 days average",
    };
  },
  created() {
    this.route = useRoute();
    this.userId = this.route.params.userId;
  },
  beforeUnmount() {
    if (this.skillsChart) this.skillsChart.destroy();
    if (this.skillDistributionChart) this.skillDistributionChart.destroy();
    if (this.objectivesChart) this.objectivesChart.destroy();
    if (this.codingTimeChart) this.codingTimeChart.destroy();
  },
  async mounted() {
    window.scrollTo({
    top: 0,
    behavior: 'smooth' // optional: smooth scroll
  });
    console.log("Component mounting...");
    await this.fetchData();
    console.log("Data fetched, creating charts...");
    this.createCharts();
    console.log("All charts created");
  },
  methods: {
    async fetchCodingTime(userId) {
      try {
        const codingTimeRef = collection(db, 'users', userId, 'codingTime');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        
        const q = query(
          codingTimeRef,
          where('timestamp', '>=', sevenDaysAgo),
          where('timestamp', '<=', today)
        );
        
        const querySnapshot = await getDocs(q);
        let totalMinutes = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timeString = data.valeur || "0:0";
          const [hoursStr, minutesStr] = timeString.split(':');
          const hours = parseInt(hoursStr) || 0;
          const minutes = parseInt(minutesStr) || 0;
          totalMinutes += (hours * 60) + minutes;
        });

        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.floor(totalMinutes % 60);
        this.weeklyCodingAverage = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      } catch (error) {
        console.error("Error fetching coding time:", error);
        this.weeklyCodingAverage = "0m";
      }
    },
    formatHeatmapDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    getDateFromTimestamp(timestamp) {
      try {
        if (timestamp?.toDate) {
          return timestamp.toDate();
        } else if (timestamp?.seconds) {
          return new Date(timestamp.seconds * 1000);
        } else if (timestamp) {
          return new Date(timestamp);
        }
        return new Date();
      } catch (e) {
        console.error("Error parsing date:", e);
        return new Date();
      }
    },
    processActivitiesForHeatmap() {
      const heatmapData = {};
      
      this.competences.forEach(skill => {
        const date = this.getDateFromTimestamp(skill.created);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });

      this.projets.forEach(project => {
        const date = this.getDateFromTimestamp(project.created);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });

      this.objectifs.forEach(objective => {
        const date = this.getDateFromTimestamp(objective.created);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });

      return heatmapData;
    },
    generateHeatmapData() {
      const activityData = this.processActivitiesForHeatmap();
      const heatmapData = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = activityData[dateStr] || 0;
      }
      this.heatmapData = heatmapData;
    },
    getHeatColor(count) {
      if (!count) return '#1a1a2e';
      if (count === 1) return '#1e3a8a';
      if (count === 2) return '#1e40af';
      if (count === 3) return '#1d4ed8';
      return '#3b82f6';
    },
    async fetchData() {
      try {
        const userDoc = await getDoc(doc(db, 'users', this.userId));
        
        if (!userDoc.exists()) {
          console.error("No user document found");
          return;
        }

        const userData = userDoc.data();
        const competencesIds = userData.compétences || [];
        const projectsIds = userData.projects || [];
        const objectifsIds = userData.objectifs || [];

        const [competencesSnapshots, projectsSnapshots, objectifsSnapshots] = await Promise.all([
          Promise.all(competencesIds.map(compId => 
            getDoc(doc(db, 'compétences', compId)).catch(e => {
              console.error(`Error fetching competence ${compId}:`, e);
              return null;
            })
          )),
          Promise.all(projectsIds.map(projId => 
            getDoc(doc(db, 'projects', projId)).catch(e => {
              console.error(`Error fetching project ${projId}:`, e);
              return null;
            })
          )),
          Promise.all(objectifsIds.map(objId => 
            getDoc(doc(db, 'objectifs', objId)).catch(e => {
              console.error(`Error fetching objective ${objId}:`, e);
              return null;
            })
            )),])

        this.competences = competencesSnapshots.filter(Boolean).map(snap => snap.data());
        this.projets = projectsSnapshots.filter(Boolean).map(snap => snap.data());
        this.objectifs = objectifsSnapshots.filter(Boolean).map(snap => snap.data());

        this.totalSkills = this.competences.length;
        this.skillLevels = {
          beginner: this.competences.filter(c => c.level === 'beginner').length,
          intermediate: this.competences.filter(c => c.level === 'intermediate').length,
          advanced: this.competences.filter(c => c.level === 'advanced').length
        };
        
        this.completedObjectives = this.objectifs.filter(o => o.status === 'completed').length;
        this.completedProjects = this.projets.length;

        this.generateHeatmapData();
        await this.fetchCodingTime(this.userId);

      } catch (error) {
        console.error("Error in fetchData:", error);
        this.competences = [];
        this.projets = [];
        this.objectifs = [];
        this.heatmapData = {};
      }
    },
    calculateSkillsByMonth() {
      const monthCounts = {};
      
      this.competences.forEach(skill => {
        try {
          let date;
          if (skill.created?.toDate) {
            date = skill.created.toDate();
          } else if (skill.created?.seconds) {
            date = new Date(skill.created.seconds * 1000);
          } else if (skill.created) {
            date = new Date(skill.created);
          } else {
            date = new Date(); // Fallback to current date
          }
          
          if (isNaN(date.getTime())) throw new Error("Invalid date");
          
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const monthYear = `${month}/${year}`;
          monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
        } catch (error) {
          console.error("Date processing error:", error, skill);
        }
      });

      // Handle empty case
      if (Object.keys(monthCounts).length === 0) {
        const currentDate = new Date();
        const currentMonthYear = `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        monthCounts[currentMonthYear] = 0;
      }

      const monthsData = Object.keys(monthCounts)
        .map(monthYear => {
          try {
            const [month, year] = monthYear.split('/').map(Number);
            const date = new Date(year, month - 1, 1);
            return { 
              monthYear: `${date.toLocaleString('default', { month: 'short' })} ${year}`,
              count: monthCounts[monthYear], 
              date 
            };
          } catch (error) {
            console.error("Month parsing error:", error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);

      // Fill in missing months
      if (monthsData.length === 0) return { labels: [], data: [] };

      const firstDate = new Date(monthsData[0].date);
      const lastDate = new Date(monthsData[monthsData.length - 1].date);
      const allMonths = [];
      
      let current = new Date(firstDate);
      current.setDate(1);
      
      while (current <= lastDate) {
        const existing = monthsData.find(m => 
          m.date.getFullYear() === current.getFullYear() && 
          m.date.getMonth() === current.getMonth()
        );

        allMonths.push({
          monthYear: `${current.toLocaleString('default', { month: 'short' })} ${current.getFullYear()}`,
          count: existing ? existing.count : 0,
          date: new Date(current)
        });

        current.setMonth(current.getMonth() + 1);
      }
      
      return {
        labels: allMonths.map(m => m.monthYear),
        data: allMonths.map(m => m.count)
      };
    },
    analyzeObjectiveStatus() {
      const statusCounts = {
        'Completed': 0,
        'In Progress': 0,
        'Not Started': 0
      };
      
      this.objectifs.forEach(obj => {
        if (obj.status === 'completed') {
          statusCounts['Completed']++;
        } else if (obj.status === 'in progress') {
          statusCounts['In Progress']++;
        } else {
          statusCounts['Not Started']++;
        }
      });
      
      return statusCounts;
    },
    createCharts() {
      // Destroy existing charts first
      if (this.skillsChart) this.skillsChart.destroy();
      if (this.skillDistributionChart) this.skillDistributionChart.destroy();
      if (this.objectivesChart) this.objectivesChart.destroy();

      // Skills Over Time Chart
      const skillsOverTime = this.calculateSkillsByMonth();
      if (this.$refs.skillsChart) {
        this.skillsChart = new Chart(this.$refs.skillsChart, {
          type: 'line',
          data: {
            labels: skillsOverTime.labels,
            datasets: [{
              label: 'Skills Added',
              data: skillsOverTime.data,
              borderColor: '#0066ff',
              backgroundColor: 'rgba(0, 102, 255, 0.2)',
              borderWidth: 2,
              tension: 0.1,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#e0e0e0'
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#aaa'
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#aaa',
                  stepSize: 1
                }
              }
            }
          }
        });
      }

      // Skill Distribution Chart
      if (this.$refs.skillDistributionChart) {
        this.skillDistributionChart = new Chart(this.$refs.skillDistributionChart, {
          type: 'doughnut',
          data: {
            labels: ['Beginner', 'Intermediate', 'Advanced'],
            datasets: [{
              data: [this.skillLevels.beginner, this.skillLevels.intermediate, this.skillLevels.advanced],
              backgroundColor: [
                'rgba(0, 102, 255, 0.7)',
                'rgba(0, 162, 255, 0.7)',
                'rgba(255, 20, 147, 0.7)'
              ],
              borderColor: [
                'rgba(0, 102, 255, 0.9)',
                'rgba(0, 162, 255, 0.9)',
                'rgba(255, 20, 147, 0.9)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: '#e0e0e0'
                }
              }
            }
          }
        });
      }

      // Objectives Completion Chart
      if (this.$refs.objectivesChart) {
        const objectiveStatus = this.analyzeObjectiveStatus();
        this.objectivesChart = new Chart(this.$refs.objectivesChart, {
          type: 'pie',
          data: {
            labels: Object.keys(objectiveStatus),
            datasets: [{
              data: Object.values(objectiveStatus),
              backgroundColor: [
                'rgba(0, 102, 255, 0.7)',
                'rgba(0, 162, 255, 0.7)',
                'rgba(255, 20, 147, 0.7)'
              ],
              borderColor: [
                'rgba(0, 102, 255, 0.9)',
                'rgba(0, 162, 255, 0.9)',
                'rgba(255, 20, 147, 0.9)'
              ],
              borderWidth: 1,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: '#e0e0e0'
                }
              }
            }
          }
        });
      }
    }
  }
};
</script>
<style scoped>
.chart-wrapper {
  position: absolute;
  top: 60px; /* Space for title */
  left: 20px;
  right: 20px;
  bottom: 20px;
}


.visualization-container {
  padding: 2rem;
  margin: 0 auto;
  font-family: 'Rajdhani', 'Courier New', monospace;
  background: rgba(10, 10, 20);
  min-height: 100vh;
  color: #e0e0e0;
}

.header {
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  position: relative;
}

.header h2 {
  font-size: 1.8rem;
  color: #027ec6;
  margin: 0;
  font-weight: 600;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: rgba(47, 47, 55, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent 48%,
    rgba(0, 102, 255, 0.1) 50%,
    transparent 52%
  );
  background-size: 5px 5px;
  opacity: 0.5;
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
.stat-card h3 {
  font-size: 1.5rem;
  color: #aaa;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #00a2ff;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: rgba(47, 47, 55, 0.4);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(5px);
  
 
  
}
.chart-container:hover{
  transform: translateY(-5px);

}

.chart-container h3 {
  font-size: 1.4rem;
  color: #fff;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.activity-heatmap {
  margin: 1rem 0;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 10px;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(53, 12px);
  grid-gap: 4px;
  margin-bottom: 1rem;
  width: max-content;
  min-width: 100%;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.3);
}

.heatmap-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 1px rgba(0, 102, 255, 0.5);
  z-index: 2;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #aaa;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.3);
}




::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(20, 20, 30, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 102, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 102, 255, 0.5);
}

.heatmap-cell::after {
  content: attr(title);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 30, 0.9);
  color: #00a2ff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  border: 1px solid rgba(0, 102, 255, 0.3);
  z-index: 10;
}

.heatmap-cell:hover::after {
  opacity: 1;
}

@media (max-width: 768px) {
  .visualization-container {
    padding: 1rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr 1fr;
  }
  
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .heatmap-grid {
    grid-template-columns: repeat(auto-fill, 12px);
  }
  .back-btn{
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
    justify-content: center;
  }
}
</style>