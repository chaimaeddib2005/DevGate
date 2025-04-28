<template>
    <div class="visualization-container">
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
          <h3>Skill Levels</h3>
          <p class="stat-value">{{ skillLevels.beginner }}B / {{ skillLevels.intermediate }}I / {{ skillLevels.advanced }}A</p>
        </div>
      </div>
  
      <div class="chart-row">
        <div class="chart-container">
          <h3>Skills Over Time</h3>
          <canvas ref="skillsChart"></canvas>
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
        <div class="legend-color" style="background-color: #ebedf0"></div>
        <div class="legend-color" style="background-color: #c6e48b"></div>
        <div class="legend-color" style="background-color: #7bc96f"></div>
        <div class="legend-color" style="background-color: #239a3b"></div>
        <div class="legend-color" style="background-color: #196127"></div>
        <span>More</span>
      </div>
    </div>
    
  </div>
        
      </div>
  
      <div class="chart-row">
        <div class="chart-container">
          <h3>Skill Distribution</h3>
          <canvas ref="skillDistributionChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>Objective Completion</h3>
          <canvas ref="objectivesChart"></canvas>
        </div>
      </div>
  
      
      
  
    
      
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from 'chart.js';
  import {db} from '../firebase';
  import { getDoc, doc } from 'firebase/firestore';

  //import { getAuth } from 'firebase/auth';
  
  Chart.register(...registerables);
  
  export default {
   
  data() {
      return {
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
        projectsChart: null,
        objectivesChart: null,
        competences: [],
        projets: [],
        objectifs: [],
        heatmapData: {} // format: {'2025-04-25': 2, ...}
  
      };
    },
    async mounted() {
      await this.fetchData();
      this.createCharts();
    },
    beforeUnmount() {
      // Clean up charts to prevent memory leaks
      if (this.skillsChart) this.skillsChart.destroy();
      if (this.skillDistributionChart) this.skillDistributionChart.destroy();
      if (this.projectsChart) this.projectsChart.destroy();
      if (this.objectivesChart) this.objectivesChart.destroy();
    },
    methods: {
      formatHeatmapDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
      processActivitiesForHeatmap() {
      const heatmapData = {};
      
      // Process competences
      this.competences.forEach(skill => {
        const date = this.getDateFromTimestamp(skill.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });
  
      // Process projects
      this.projets.forEach(project => {
        const date = this.getDateFromTimestamp(project.createTimeStamp || project.modifTimeStamp);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });
  
      // Process objectives
      this.objectifs.forEach(objective => {
        const date = this.getDateFromTimestamp(objective.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      });
  
      return heatmapData;
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
  
    generateHeatmapData() {
      const activityData = this.processActivitiesForHeatmap();
      const heatmapData = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Generate data for the last 365 days
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        heatmapData[dateStr] = activityData[dateStr] || 0;
      }
  
      this.heatmapData = heatmapData;
    },
      getHeatColor(count) {
        if (!count) return '#ebedf0';
        if (count === 1) return '#c6e48b';
        if (count === 2) return '#7bc96f';
        if (count === 3) return '#239a3b';
        return '#196127'; // 4+
      },
      
  
  
      async fetchData() {
        const userId = "ElqLIzH7MFhsSkB6AijK";
        try {
          // Get user document first
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.data();
  
          // Fetch referenced competences
          const competencesPromises = userData.compétences.map(compId => 
            getDoc(doc(db, 'compétences', compId))
          );
          const competencesSnapshots = await Promise.all(competencesPromises);
          this.competences = competencesSnapshots.map(snap => snap.data());
  
          // Fetch referenced objectifs
          const objectifsPromises = userData.objectifs.map(objId => 
            getDoc(doc(db, 'objectifs', objId))
          );
          const objectifsSnapshots = await Promise.all(objectifsPromises);
          this.objectifs = objectifsSnapshots.map(snap => snap.data());
  
          // Fetch referenced projets
          const projetsPromises = userData.projets.map(projId => 
            getDoc(doc(db, 'projets', projId))
          );
          const projetsSnapshots = await Promise.all(projetsPromises);
          this.projets = projetsSnapshots.map(snap => snap.data());
  
          // Process data
          this.totalSkills = this.competences.length;
          this.skillLevels = {
            beginner: this.competences.filter(c => c.level === 'beginner').length,
            intermediate: this.competences.filter(c => c.level === 'intermediate').length,
            advanced: this.competences.filter(c => c.level === 'advanced').length
          };
          
          this.completedObjectives = this.objectifs.filter(o => o.status === 'Completed').length;
          this.completedProjects = this.projets.length;
          
  
          this.generateHeatmapData();
  
  
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
      

      
      createCharts() {
        // Skills Over Time Chart
        const skillsOverTime = this.calculateSkillsByMonth();
        console.log("Creating skills chart with:", skillsOverTime);
      this.skillsChart = new Chart(this.$refs.skillsChart, {
        type: 'line',
        data: {
          labels: skillsOverTime.labels,
          datasets: [{
            label: 'Skills Added',
            data: skillsOverTime.data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Skills Added'
              },
              ticks: {
                stepSize: 1,
                precision: 0
              }
            }
          }
        }
      });
        
        // Skill Distribution Chart
        this.skillDistributionChart = new Chart(this.$refs.skillDistributionChart, {
          type: 'doughnut',
          data: {
            labels: ['Beginner', 'Intermediate', 'Advanced'],
            datasets: [{
              data: [this.skillLevels.beginner, this.skillLevels.intermediate, this.skillLevels.advanced],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
        
        // Projects Activity Chart
        this.projectsChart = new Chart(this.$refs.projectsChart, {
          type: 'bar',
          data: {
            labels: ['Web Apps', 'Mobile Apps', 'APIs', 'Libraries', 'CLI Tools', 'Other'],
            datasets: [{
              label: 'Projects by Type',
              data: [12, 5, 8, 6, 3, 2],
              backgroundColor: 'rgba(153, 102, 255, 0.7)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
        
        // Objectives Completion Chart
        const objectiveStatus = this.analyzeObjectiveStatus();
        this.objectivesChart = new Chart(this.$refs.objectivesChart, {
          type: 'pie',
          data: {
            labels: Object.keys(objectiveStatus),
            datasets: [{
              data: Object.values(objectiveStatus),
              backgroundColor: [
                'rgba(75, 192, 192, 0.7)', // Completed
                'rgba(255, 206, 86, 0.7)',  // In Progress
                'rgba(255, 99, 132, 0.7)'   // Not Started
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
      },
      calculateSkillsByMonth() {
    console.log("Raw competences data:", this.competences);
    
    const monthCounts = {};
    
    this.competences.forEach(skill => {
      console.log("Raw timestamp:", skill.timestamp);
      
      let date;
      try {
        if (skill.timestamp?.toDate) {
          date = skill.timestamp.toDate();
        } else if (skill.timestamp?.seconds) {
          date = new Date(skill.timestamp.seconds * 1000);
        } else if (skill.timestamp) {
          date = new Date(skill.timestamp);
        } else {
          date = new Date();
          console.warn("Missing timestamp for skill:", skill.name);
        }
        
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        
        // Use numeric month instead of localized string
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const monthYear = `${month}/${year}`; // Use numeric format for reliable parsing
        
        console.log("Formatted monthYear:", monthYear);
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      } catch (error) {
        console.error("Date processing error:", error);
      }
    });
  
    console.log("Month counts before sorting:", monthCounts);
    
    // Convert to array and sort
    const monthsData = Object.keys(monthCounts).map(monthYear => {
      try {
        const [month, year] = monthYear.split('/').map(Number);
        const date = new Date(year, month - 1, 1); // month is 0-11 in Date
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        return { 
          monthYear: `${date.toLocaleString('default', { month: 'short' })} ${year}`,
          count: monthCounts[monthYear], 
          date 
        };
      } catch (error) {
        console.error("Month parsing error:", error);
        return null;
      }
    }).filter(Boolean);
  
    monthsData.sort((a, b) => a.date - b.date);
    console.log("Sorted months data:", monthsData);
  
    // Gap filling
    if (monthsData.length === 0) {
      console.warn("No valid month data available");
      return { labels: [], data: [] };
    }
  
    const firstDate = new Date(monthsData[0].date);
    const lastDate = new Date(monthsData[monthsData.length - 1].date);
    const allMonths = [];
  
    firstDate.setDate(1);
    
    let current = new Date(firstDate);
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
  
    console.log("Final data with filled gaps:", allMonths);
    
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
        console.log(this.objectifs);
        this.objectifs.forEach(obj => {
          if (obj.status === 'Completed') {
            statusCounts['Completed']++;
          } else if (obj.status === 'In Progress') {
            statusCounts['In Progress']++;
          } else {
            statusCounts['Not Started']++;
          }
        });
        
        return statusCounts;
      },
  
  
      
      updateVisualizations() {
        // This would filter data based on the selected time range
        // In a real implementation, you would refetch filtered data from Firestore
        console.log('Updating visualizations for time range:', this.timeRange);
        // Destroy old charts and create new ones with filtered data
        if (this.skillsChart) this.skillsChart.destroy();
        if (this.skillDistributionChart) this.skillDistributionChart.destroy();
        if (this.projectsChart) this.projectsChart.destroy();
        if (this.objectivesChart) this.objectivesChart.destroy();
        this.createCharts();
      },
      
      formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .visualization-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-top: 10px;
    color: #4a6cf7;
  }
  
  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .chart-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container h3 {
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  .activity-timeline {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .timeline-item {
    display: flex;
    margin-bottom: 15px;
  }
  
  .timeline-marker {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 15px;
    flex-shrink: 0;
  }
  
  .timeline-marker.skill {
    background-color: #4a6cf7;
  }
  
  .timeline-marker.project {
    background-color: #4bc0c0;
  }
  
  .timeline-marker.objective {
    background-color: #ff6384;
  }
  
  .timeline-date {
    font-size: 12px;
    color: #666;
    margin: 0;
  }
  
  .timeline-text {
    margin: 5px 0 0 0;
  }
  
  @media (max-width: 768px) {
    .stats-overview {
      grid-template-columns: 1fr 1fr;
    }
    
    .chart-row {
      grid-template-columns: 1fr;
    }
  }
  
  .activity-heatmap {
    margin: 2rem 0;
  }
  
  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 15px);
    grid-gap: 4px;
    max-width: 100%;
    overflow-x: auto;
  }
  
  .heatmap-cell {
    width: 15px;
    height: 15px;
    border-radius: 2px;
    transition: background-color 0.3s ease;
  }
  
  .heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    gap: 5px;
  }
  
  .legend-color {
    width: 15px;
    height: 15px;
    border-radius: 2px;
  }
  
  </style>