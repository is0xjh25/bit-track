<template>
  <div class="market-container">
    <h3>Crypto Market</h3>
    <p>Check current market prices for cryptocurrencies.</p>

    <div class="market-wrapper" v-if="isLargeScreen">
      <table class="market-table">
        <thead>
          <tr>
            <th @click="sortColumn('name')">Name</th>
            <th @click="sortColumn('symbol')">Symbol</th>
            <th @click="sortColumn('current_price')">Price</th>
            <th @click="sortColumn('price_change_percentage_24h')">
              24h Change
            </th>
            <th @click="sortColumn('market_cap')">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(crypto, index) in sortedCryptocurrencies"
            :key="index"
            @click="openCoinLink(crypto)"
            class="row-clickable"
          >
            <td>{{ crypto.name }}</td>
            <td>{{ crypto.symbol }}</td>
            <td>{{ crypto.current_price }}</td>
            <td>{{ crypto.price_change_percentage_24h }}%</td>
            <td>{{ crypto.market_cap }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="market-wrapper" v-else>
      <table class="market-table">
        <thead>
          <tr>
            <th @click="sortColumn('symbol')">Symbol</th>
            <th @click="sortColumn('current_price')">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(crypto, index) in sortedCryptocurrencies"
            :key="index"
            @click="openCoinLink(crypto)"
            class="row-clickable"
          >
            <td>{{ crypto.symbol }}</td>
            <td>{{ crypto.current_price }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-controls">
      <q-btn
        v-if="isLargeScreen"
        label="Previous"
        @click="previousPage"
        color="primary"
      />
      <q-icon
        v-else
        name="arrow_left"
        @click="previousPage"
        :class="{ disabled: currentPage === 1 || loading }"
        color="primary"
        class="icon-mobile pagination-icon"
      />

      <div class="page-input-go">
        <q-input
          v-model.number="currentPageInput"
          label="Page"
          type="number"
          min="1"
          :max="totalPages"
          dense
          color="secondary"
          class="white-font"
          style="width: 80px; text-align: center"
        />
        <q-btn
          v-if="isLargeScreen"
          label="Go"
          @click="goToPage"
          color="primary"
        />
        <q-icon
          v-else
          name="rocket"
          @click="goToPage"
          :class="{ disabled: loading }"
          color="primary"
          class="icon-mobile pagination-icon"
        />
      </div>

      <q-btn
        v-if="isLargeScreen"
        label="Next"
        @click="nextPage"
        color="primary"
      />
      <q-icon
        v-else
        name="arrow_right"
        @click="nextPage"
        :class="{ disabled: loading }"
        color="primary"
        class="icon-mobile pagination-icon"
      />
    </div>

    <div v-if="loading" class="loading-message">Loading market data...</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <p class="attribution-text">All data is provided by CoinGecko.</p>
  </div>
</template>

<script>
import { fetchCryptoMarket } from "../services/cryptoAPI";

export default {
  data() {
    return {
      cryptocurrencies: [],
      currentPage: 1,
      currentPageInput: 1,
      autoRefreshInterval: null,
      isLargeScreen: window.innerWidth > 768,
      loading: false,
      errorMessage: "",
      totalPages: 100,
      sortColumnKey: "name",
      sortAscending: true,
      coingeckoBaseURL: "https://www.coingecko.com/en/coins/",
    };
  },
  computed: {
    sortedCryptocurrencies() {
      return [...this.cryptocurrencies].sort((a, b) => {
        const key = this.sortColumnKey;
        const valA = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];
        const valB = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];

        if (valA < valB) return this.sortAscending ? -1 : 1;
        if (valA > valB) return this.sortAscending ? 1 : -1;
        return 0;
      });
    },
  },
  methods: {
    async loadCryptocurrencies(page = 1) {
      this.loading = true;
      this.errorMessage = "";
      try {
        this.cryptocurrencies = await fetchCryptoMarket(page);
        this.currentPage = page;
        this.currentPageInput = page;
      } catch (error) {
        if (!error.response) {
          this.errorMessage =
            "Network error: Unable to fetch data due to a CORS policy issue or no internet connection.";
        } else {
          this.errorMessage = "Failed to load cryptocurrency data.";
        }
      } finally {
        this.loading = false;
      }
    },
    sortColumn(columnKey) {
      if (this.sortColumnKey === columnKey) {
        this.sortAscending = !this.sortAscending;
      } else {
        this.sortColumnKey = columnKey;
        this.sortAscending = true;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.loadCryptocurrencies(this.currentPage + 1);
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.loadCryptocurrencies(this.currentPage - 1);
      }
    },
    goToPage() {
      if (
        this.currentPageInput >= 1 &&
        this.currentPageInput <= this.totalPages
      ) {
        this.loadCryptocurrencies(this.currentPageInput);
      }
    },
    handleResize() {
      this.isLargeScreen = window.innerWidth > 768;
    },
    openCoinLink(row) {
      const coinId = row.id;
      if (coinId) {
        window.open(`${this.coingeckoBaseURL}${coinId}`, "_blank");
      } else {
        console.error("Coin ID is undefined for this row:", row);
      }
    },
  },
  mounted() {
    this.loadCryptocurrencies();
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    this.autoRefreshInterval = setInterval(() => {
      this.loadCryptocurrencies(this.currentPage);
    }, 60000);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    clearInterval(this.autoRefreshInterval);
  },
};
</script>

<style scoped>
.market-container {
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

.market-wrapper {
  overflow-y: auto;
  width: 100%;
  max-height: 60vh;
}

.market-table {
  width: 100%;
  border-collapse: collapse;
}

.market-table th,
.market-table td {
  padding: 10px;
  text-align: center;
  border-top: 1px solid var(--q-secondary);
  border-bottom: 1px solid var(--q-secondary);
  cursor: pointer;
}

.market-table th {
  background-color: #f3f4f6;
}

.market-table tbody tr:hover {
  background-color: #e9ecef;
}

.market-wrapper::-webkit-scrollbar {
  width: 8px;
}

.market-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.market-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--q-primary);
  border-radius: 10px;
}

.market-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: var(--q-secondary);
}

.market-wrapper {
  scrollbar-width: thin;
  scrollbar-color: var(--q-primary) transparent;
}

.row-clickable {
  cursor: pointer;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.page-input-go {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-mobile,
.pagination-icon {
  font-size: 2em;
}

.pagination-button {
  font-size: 1.2em;
  padding: 12px 20px;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.attribution-text {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #888;
}

.loading-message,
.error-message {
  text-align: center;
  font-size: 1.1rem;
  margin-top: 25px;
  color: #888;
}

.error-message {
  color: var(--q-negative);
}

:deep(.white-font .q-field__native),
:deep(.white-font .q-field__label) {
  color: var(--q-secondary) !important;
}
</style>
