import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useCryptoStore = defineStore("cryptoStore", () => {
  // State
  const cryptocurrencies = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const loading = ref(false);
  const errorMessage = ref(null);
  const itemsPerPage = ref(10);
  const COIN_GECKO = "https://api.coingecko.com/api/v3/coins/markets";
  let autoRefreshInterval = null;

  // Actions
  const fetchAllCryptocurrencies = async () => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const storedData = localStorage.getItem("cryptocurrencies");
      const storedTimestamp = localStorage.getItem(
        "cryptocurrencies_timestamp"
      );

      const isDataFresh =
        storedData &&
        storedTimestamp &&
        new Date().getTime() - parseInt(storedTimestamp, 10) < 60000;

      if (isDataFresh) {
        // Use data from localStorage
        cryptocurrencies.value = JSON.parse(storedData);
        totalPages.value = Math.ceil(
          cryptocurrencies.value.length / itemsPerPage.value
        );
        console.log("Using cached data:", new Date().toISOString());
      } else {
        const response = await axios.get(COIN_GECKO, {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 250,
            page: 1,
          },
        });

        cryptocurrencies.value = response.data;

        localStorage.setItem(
          "cryptocurrencies",
          JSON.stringify(cryptocurrencies.value)
        );
        localStorage.setItem(
          "cryptocurrencies_timestamp",
          new Date().getTime().toString()
        );

        totalPages.value = Math.ceil(
          cryptocurrencies.value.length / itemsPerPage.value
        );
        console.log("Fetched new data:", new Date().toISOString());
      }
      startAutoRefresh();
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message ||
        "Failed to load cryptocurrency data. Please try again later.";
      console.error("API Error:", error);
    } finally {
      loading.value = false;
    }
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(() => {
      fetchAllCryptocurrencies();
      console.log("Auto Refresh:", new Date().toISOString());
    }, 60000);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval); // Clear the interval properly
      autoRefreshInterval = null; // Reset the interval ID
    }
  };

  // Getters
  const getPageData = (page = 1) => {
    const startIndex = (page - 1) * itemsPerPage.value;
    const endIndex = page * itemsPerPage.value;
    return cryptocurrencies.value.slice(startIndex, endIndex);
  };

  const getPriceByName = (coinName) => {
    const coin = cryptocurrencies.value.find(
      (crypto) => crypto.name.toLowerCase() === coinName.toLowerCase()
    );
    return coin ? coin.current_price : null; // Return price or null if not found
  };

  return {
    cryptocurrencies,
    currentPage,
    totalPages,
    loading,
    errorMessage,
    fetchAllCryptocurrencies,
    startAutoRefresh,
    stopAutoRefresh,
    getPageData,
    getPriceByName,
  };
});
