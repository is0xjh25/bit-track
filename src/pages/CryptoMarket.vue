<template>
  <div class="market-container">
    <h1>Crypto Market</h1>
    <p>Check current market prices for cryptocurrencies.</p>
    <ul>
      <li v-for="(crypto, index) in cryptocurrencies" :key="index">
        {{ crypto.name }} - {{ crypto.price }} USD
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cryptocurrencies: [
        { name: "Bitcoin", price: 50000 },
        { name: "Ethereum", price: 3000 },
      ],
    };
  },
};
</script>

<style scoped>
.market-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
