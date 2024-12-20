import { defineStore } from "pinia";
import { ref } from "vue";
import { useLogger } from "src/composables/useLogger";
import { fetchCryptoMarket } from "src/services/UseMarketAPI";

export const useCryptoStore = defineStore("cryptoStore", () => {
  // State
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
      const DATA_FRESHNESS_DURATION = 60000; // 1 minute

      let parsedData = null;

      // Safely parse cached data
      try {
        parsedData = storedData ? JSON.parse(storedData) : null;
      } catch (e) {
        logger.error("Error parsing cached data:", e.message);
        localStorage.removeItem("cryptocurrencies"); // Clear corrupted data
      }

      const isDataFresh =
        parsedData &&
        storedTimestamp &&
        new Date().getTime() - parseInt(storedTimestamp, 10) <
          DATA_FRESHNESS_DURATION;

      if (isDataFresh) {
        cryptocurrencies.value = parsedData;
        totalPages.value = Math.ceil(
          cryptocurrencies.value.length / itemsPerPage.value
        );
        logger.info("Fetched cached data:");
      } else {
        logger.warn("Outdated cached data:");
        const response = await fetchCryptoMarket({
          per_page: 250,
          page: 1,
          vs_currency: "usd",
        });

        // Validate response

        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid API response format.");
        }

        cryptocurrencies.value = response;

        // Cache data in localStorage
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
    } catch (error) {
      errorMessage.value =
        error.message ||
        "Failed to load cryptocurrency data. Please try again later.";
      logger.error("API Error:", error);
    } finally {
      loading.value = false;
      startAutoRefresh();
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
