<template>
  <div class="portfolio-container">
    <h1>Your Portfolio</h1>
    <p>Manage your cryptocurrency portfolio here.</p>
    <ul>
      <li v-for="(asset, index) in assets" :key="index">
        {{ asset.name }} - {{ asset.value }} USD
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      assets: [
        { name: "Bitcoin", value: 50000 },
        { name: "Ethereum", value: 3000 },
      ],
    };
  },
};
</script>

<style scoped>
.portfolio-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
