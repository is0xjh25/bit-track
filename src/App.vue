<template>
  <router-view />
</template>

<script>
import { useCryptoStore } from "/src/stores/cryptoDataStore";

export default {
  setup() {
    const cryptoStore = useCryptoStore();

    if (!cryptoStore.cryptocurrencies.length) {
      cryptoStore.fetchAllCryptocurrencies();
    }

    return {};
  },
};
</script>

<style>
body {
  font-family: "Orbitron", sans-serif;
  background-color: var(--q-dark);
  color: var(--q-light);
}
</style>
