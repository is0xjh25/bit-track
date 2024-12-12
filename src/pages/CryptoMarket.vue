<template>
  <div class="market-container">
    <CustomHeading>
    <template #heading>Crypto Market</template>
    <template #subheading>Check current market prices for cryptocurrencies.</template>
    </CustomHeading>
    <div v-if="cryptoStore.loading" class="loading-message">
      Loading market data...
    </div>
    <div v-else-if="cryptoStore.errorMessage" class="error-message">
      {{ cryptoStore.errorMessage }}
    </div>
    <div v-else>
      <div class="market-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th @click="sortColumn('name')" v-show="isLargeScreen">Name</th>
              <th @click="sortColumn('symbol')">Symbol</th>
              <th @click="sortColumn('current_price')">Price</th>
              <th @click="sortColumn('price_change_percentage_24h')">24h%</th>
              <th @click="sortColumn('market_cap')" v-show="isLargeScreen">
                Market Cap
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="crypto in sortedPageData"
              :key="crypto.id"
              @click="openCoinLink(crypto)"
              class="row-clickable"
            >
              <td v-show="isLargeScreen">{{ crypto.name }}</td>
              <td>{{ crypto.symbol }}</td>
              <td>${{ crypto.current_price }}</td>
              <td>{{ crypto.price_change_percentage_24h }}%</td>
              <td v-show="isLargeScreen">${{ crypto.market_cap }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-controls">
        <q-btn
          v-if="isLargeScreen"
          label="Previous"
          @click="previousPage"
          :disable="cryptoStore.currentPage === 1"
          color="primary"
        />
        <q-icon
          v-else
          name="arrow_left"
          @click="previousPage"
          :class="{ disabled: cryptoStore.currentPage === 1 }"
          color="primary"
          class="icon-mobile pagination-icon"
        />

        <div class="page-input-go">
          <q-input
            v-model.number="currentPageInput"
            label="Page"
            type="number"
            min="1"
            :max="cryptoStore.totalPages"
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
            :class="{ disabled: cryptoStore.loading }"
            color="primary"
            class="icon-mobile pagination-icon"
          />
        </div>

        <q-btn
          v-if="isLargeScreen"
          label="Next"
          @click="nextPage"
          :disable="cryptoStore.currentPage === cryptoStore.totalPages"
          color="primary"
        />
        <q-icon
          v-else
          name="arrow_right"
          @click="nextPage"
          :class="{
            disabled: cryptoStore.currentPage === cryptoStore.totalPages,
          }"
          color="primary"
          class="icon-mobile pagination-icon"
        />
      </div>
    </div>
    <p class="attribution-text">All data is provided by CoinGecko.</p>
  </div>
</template>

<script>
import { useCryptoStore } from "/src/stores/cryptoDataStore.js";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import CustomHeading from "/src/components/CustomHeading.vue";


export default {
  components: {
    CustomHeading,
  },
  setup() {
    const COIN_GECKO = "https://www.coingecko.com/en/coins/";
    const cryptoStore = useCryptoStore();
    const pageData = ref([]);
    const sortKey = ref("name");
    const sortAscending = ref(true);
    const currentPageInput = ref(cryptoStore.currentPage);
    const windowWidth = ref(window.innerWidth);
    const isLargeScreen = computed(() => windowWidth.value > 768);

    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener("resize", updateWindowWidth);
      updatePageData();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateWindowWidth);
    });

    const updatePageData = () => {
      pageData.value = cryptoStore.getPageData(cryptoStore.currentPage);
    };

    watch(
      [
        () => cryptoStore.cryptocurrencies,
        () => cryptoStore.currentPage,
        () => cryptoStore.loading,
      ],
      () => {
        updatePageData();
        currentPageInput.value = cryptoStore.currentPage;
      }
    );

    const sortedPageData = computed(() => {
      return [...pageData.value].sort((a, b) => {
        const valA =
          typeof a[sortKey.value] === "string"
            ? a[sortKey.value].toLowerCase()
            : a[sortKey.value];
        const valB =
          typeof b[sortKey.value] === "string"
            ? b[sortKey.value].toLowerCase()
            : b[sortKey.value];
        if (valA < valB) return sortAscending.value ? -1 : 1;
        if (valA > valB) return sortAscending.value ? 1 : -1;
        return 0;
      });
    });

    const sortColumn = (key) => {
      if (sortKey.value === key) {
        sortAscending.value = !sortAscending.value;
      } else {
        sortKey.value = key;
        sortAscending.value = true;
      }
    };

    const nextPage = () => {
      if (cryptoStore.currentPage < cryptoStore.totalPages) {
        cryptoStore.currentPage++;
      }
    };

    const previousPage = () => {
      if (cryptoStore.currentPage > 1) {
        cryptoStore.currentPage--;
      }
    };

    const goToPage = () => {
      if (
        currentPageInput.value >= 1 &&
        currentPageInput.value <= cryptoStore.totalPages
      ) {
        cryptoStore.currentPage = currentPageInput.value;
      } else {
        cryptoStore.currentPage = cryptoStore.totalPages;
      }
    };

    const openCoinLink = (crypto) => {
      window.open(`${COIN_GECKO}${crypto.id}`, "_blank");
    };

    return {
      cryptoStore,
      pageData,
      currentPageInput,
      sortedPageData,
      sortColumn,
      nextPage,
      previousPage,
      goToPage,
      openCoinLink,
      isLargeScreen,
    };
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
  background-color: var(--q-secondary);
}

.market-table tbody tr:hover {
  background-color: var(--q-secondary);
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
  font-size: 3em;
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
