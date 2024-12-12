<template>
  <div class="recommendation-container">
    <CustomHeading>AI Consultant</CustomHeading>
    <p>Get AI-driven recommendations for your crypto portfolio.</p>

    <!-- Centered Button with Lightbulb Icon -->

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
    <div class="button-container">
      <q-btn
        label="Portfolio analysis"
        color="primary"
        icon="lightbulb"
        @click="performAnalysis"
      />
    </div>
  </div>
</template>

<script>
import recommendations from "/src/mock/recommendations.json";
import CustomHeading from "/src/components/CustomHeading.vue";


export default {
  components: {
    CustomHeading,
  },
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
  max-height: 80vh;
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: left;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.recommendations-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  max-height: 60vh;
}

/* Custom Scrollbar Styling */
.recommendations-wrapper::-webkit-scrollbar {
  width: 8px; /* Set scrollbar width */
}

.recommendations-wrapper::-webkit-scrollbar-track {
  background: transparent; /* No background for the track */
}

.recommendations-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--q-primary); /* Primary color for the thumb */
  border-radius: 10px; /* Rounded corners for the thumb */
}

.recommendations-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: var(
    --q-secondary
  ); /* Slightly darker on hover for better UX */
}

/* Firefox Scrollbar */
.recommendations-wrapper {
  scrollbar-width: thin; /* Thin scrollbar */
  scrollbar-color: var(--q-primary) transparent; /* Primary thumb color, transparent track */
}

.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}n

.recommendation-item {
  margin-bottom: 10px;
  border: 1px solid var(--q-secondary);
  border-radius: 5px;
  overflow: hidden;
  transition: background-color 0.3s;
  font-family: sans-serif; /* Sans-serif font for list */
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
  font-family: sans-serif; /* Sans-serif font for header */
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
  font-family: sans-serif; /* Sans-serif font for title */
}

.date {
  font-size: 0.9em;
  color: var(--q-secondary);
  font-family: sans-serif; /* Sans-serif font for date */
}

.recommendation-text {
  padding: 15px;
  font-size: 1em;
  color: var(--q-secondary);
  background-color: var(--q-dark);
  font-family: sans-serif; /* Sans-serif font for recommendation text */
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
