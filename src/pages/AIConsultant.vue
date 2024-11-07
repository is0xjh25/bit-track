<template>
  <div class="recommendation-container">
    <h3>AI Consultant</h3>
    <p>Get AI-driven recommendations for your crypto portfolio.</p>

    <!-- Centered Button with Lightbulb Icon -->
    <div class="button-container">
      <q-btn
        label="Portfolio analysis"
        color="primary"
        icon="lightbulb"
        @click="performAnalysis"
      />
    </div>

    <div class="recommendations-wrapper">
      <ul class="recommendations-list">
        <li
          v-for="(item, index) in recommendations"
          :key="index"
          class="recommendation-item"
        >
          <div @click="toggleRecommendation(index)" class="toggle-header">
            <span class="toggle-icon">
              <q-icon
                :name="expandedIndex === index ? 'expand_less' : 'expand_more'"
              />
            </span>
            <span class="title">{{ item.title }}</span>
            <span class="date">{{ item.date }}</span>
          </div>
          <div v-if="expandedIndex === index" class="recommendation-text">
            {{ item.recommendation }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import recommendations from "/src/mock/recommendations.json";

export default {
  data() {
    return {
      recommendations,
      expandedIndex: null,
    };
  },
  methods: {
    toggleRecommendation(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
    performAnalysis() {
      console.log("Performing portfolio analysis...");
    },
  },
};
</script>

<style scoped>
.recommendation-container {
  margin: auto;
  width: 80vw;
  min-width: 350px;
  max-height: 80vh; /* Limit height for fixed layout */
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.recommendations-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  max-height: 60vh; /* Set height restriction only for large screens */
}

.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-item {
  margin-bottom: 10px;
  border: 1px solid var(--q-secondary);
  border-radius: 5px;
  overflow: hidden;
  transition: background-color 0.3s;
}

.recommendation-item:hover {
  background-color: var(--q-dark);
}

.toggle-header {
  display: flex;
  align-items: center;
  padding: 15px;
  font-size: 1.1em;
  background-color: var(--q-dark);
  color: var(--q-primary);
  cursor: pointer;
}

.toggle-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 1.5em;
  color: var(--q-primary);
}

.title {
  flex: 1;
}

.date {
  font-size: 0.9em;
  color: var(--q-secondary);
}

.recommendation-text {
  padding: 15px;
  font-size: 1em;
  color: var(--q-secondary);
  background-color: var(--q-dark);
}

/* Remove height restriction on small screens */
@media (max-width: 768px) {
  .recommendation-container {
    margin: auto;
    overflow: auto;
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 100vh;
  }

  .recommendations-wrapper {
    flex-grow: 1;
    overflow-y: auto;
    width: 100%;
  }
}
</style>
