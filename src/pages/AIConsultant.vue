<template>
  <div class="recommendation-container">
    <h1>AI Consultant</h1>
    <p>Get AI-driven recommendations for your crypto portfolio.</p>
    <ul>
      <li v-for="(recommendation, index) in recommendations" :key="index">
        {{ recommendation.text }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recommendations: [
        { text: "Consider adding more Bitcoin to your portfolio." },
        { text: "Ethereum is expected to rise in value." },
      ],
    };
  },
};
</script>

<style scoped>
.recommendation-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
