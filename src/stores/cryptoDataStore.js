import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useLogger } from "/src/composables/UseLogger";

export const useCryptoStore = defineStore("cryptoStore", () => {
  // State
  const COIN_GECKO = "https://api.coingecko.com/api/v3/coins/markets";
  const cryptocurrencies = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const loading = ref(false);
  const errorMessage = ref(null);
  const itemsPerPage = ref(10);
  const logger = useLogger();
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
        new Date().getTime() - parseInt(storedTimestamp, 10) < 120000;

      if (isDataFresh) {
        cryptocurrencies.value = JSON.parse(storedData);
        totalPages.value = Math.ceil(
          cryptocurrencies.value.length / itemsPerPage.value
        );
        logger.info("Fetched cached data:");
      } else {
        logger.warn("Outdated cached data:");
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
        logger.info("Fetched new data:", new Date().toISOString());
      }
      startAutoRefresh();
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message ||
        "Failed to load cryptocurrency data. Please try again later.";
      logger.error("API Error:", error);
    } finally {
      loading.value = false;
    }
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(() => {
      fetchAllCryptocurrencies();
      logger.info("Auto Refresh:", new Date().toISOString());
    }, 60000);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
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
    return coin ? coin.current_price : null;
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
