<template>
  <div class="market-container">
    <h3>Crypto Market</h3>
    <p>Check current market prices for cryptocurrencies.</p>

    <div class="table-wrapper">
      <q-table
        v-if="isLargeScreen"
        :rows="cryptocurrencies"
        :columns="largeScreenColumns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :pagination="paginationOptions"
        :rows-per-page-options="[]"
        hide-bottom
        class="clickable-rows"
      >
        <template v-slot:body="props">
          <tr
            @click="openCoinLink(props.row)"
            class="row-clickable"
            style="border-bottom: 5px solid var(--q-secondary)"
          >
            <td style="color: var(--q-secondary)">{{ props.row.name }}</td>
            <td style="color: var(--q-secondary); text-align: right">
              {{ props.row.symbol }}
            </td>
            <td style="color: var(--q-secondary); text-align: right">
              {{ props.row.current_price }}
            </td>
            <td style="color: var(--q-secondary); text-align: right">
              {{ props.row.price_change_percentage_24h }}%
            </td>
            <td style="color: var(--q-secondary); text-align: right">
              {{ props.row.market_cap }}
            </td>
          </tr>
        </template>
      </q-table>

      <q-table
        v-else
        :rows="cryptocurrencies"
        :columns="smallScreenColumns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :pagination="paginationOptions"
        :rows-per-page-options="[]"
        hide-bottom
        class="clickable-rows"
      >
        <template v-slot:body="props">
          <tr @click="openCoinLink(props.row)" class="row-clickable">
            <td style="color: var(--q-secondary)" class="align-center">
              {{ props.row.symbol }}
            </td>
            <td style="color: var(--q-secondary)" class="align-right">
              {{ props.row.current_price }}
            </td>
            <td style="color: var(--q-secondary)" class="align-right">
              {{ props.row.price_change_percentage_24h }}%
            </td>
          </tr>
        </template>
      </q-table>
    </div>

    <div class="pagination-controls">
      <q-btn
        v-if="isLargeScreen"
        label="Previous"
        @click="previousPage"
        :disabled="currentPage === 1 || loading"
        color="primary"
      />
      <q-icon
        v-else
        name="arrow_left"
        @click="previousPage"
        :class="{ disabled: currentPage === 1 || loading }"
        color="primary"
        class="icon-mobile"
        style="cursor: pointer"
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
          @keyup.enter="goToPage"
        />
        <q-btn
          v-if="isLargeScreen"
          label="Go"
          @click="goToPage"
          :disabled="loading"
          color="primary"
        />
        <q-icon
          v-else
          name="rocket"
          @click="goToPage"
          :class="{ disabled: loading }"
          color="primary"
          class="icon-mobile"
          style="cursor: pointer"
        />
      </div>

      <q-btn
        v-if="isLargeScreen"
        label="Next"
        @click="nextPage"
        :disabled="loading"
        color="primary"
      />
      <q-icon
        v-else
        name="arrow_right"
        @click="nextPage"
        :class="{ disabled: loading }"
        color="primary"
        class="icon-mobile"
        style="cursor: pointer"
      />
    </div>

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
      largeScreenColumns: [
        {
          name: "name",
          label: "Name",
          field: "name",
          align: "left",
          sortable: true,
        },
        {
          name: "symbol",
          label: "Symbol",
          field: "symbol",
          align: "right",
          sortable: true,
        },
        {
          name: "current_price",
          label: "Price (USD)",
          field: "current_price",
          align: "right",
          sortable: true,
        },
        {
          name: "price_change_percentage_24h",
          label: "24h Change (%)",
          field: "price_change_percentage_24h",
          align: "right",
          sortable: true,
          format: (val) => `${val.toFixed(2)}%`,
        },
        {
          name: "market_cap",
          label: "Market Cap",
          field: "market_cap",
          align: "right",
          sortable: true,
        },
      ],
      smallScreenColumns: [
        {
          name: "symbol",
          label: "Symbol",
          field: "symbol",
          align: "center",
          sortable: true,
        },
        {
          name: "current_price",
          label: "Price",
          field: "current_price",
          align: "center",
          sortable: true,
        },
        {
          name: "price_change_percentage_24h",
          label: "%Change",
          field: "price_change_percentage_24h",
          align: "center",
          sortable: true,
          format: (val) => `${val.toFixed(1)}%`,
        },
      ],
      loading: false,
      paginationOptions: { rowsPerPage: 10 },
      totalPages: 100,
      isLargeScreen: window.innerWidth > 768,
    };
  },
  methods: {
    async loadCryptocurrencies(page = 1) {
      this.loading = true;
      try {
        this.cryptocurrencies = await fetchCryptoMarket(page);
        this.currentPage = page;
        this.currentPageInput = page;
      } catch (error) {
        console.error("Failed to load cryptocurrencies:", error);
      } finally {
        this.loading = false;
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
        window.open(`https://www.coingecko.com/en/coins/${coinId}`, "_blank");
      } else {
        console.error("Coin ID is undefined for this row:", row);
      }
    },
  },
  mounted() {
    this.loadCryptocurrencies();
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    // Set up auto-refresh every 1 minutes
    this.autoRefreshInterval = setInterval(() => {
      this.loadCryptocurrencies(this.currentPage);
    }, 60000); // 60000 ms = 1 minutes
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    clearInterval(this.autoRefreshInterval); // Clear the interval to prevent memory leaks
  },
};
</script>

<style scoped>
.market-container {
  margin: auto;
  width: 80vw;
  min-width: 350px;
  overflow: hidden !important;
}

@media (min-width: 768px) {
  .table-wrapper {
    max-height: 450px;
    overflow-y: auto;
  }
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
.icon-mobile {
  font-size: 10vw;
}
.attribution-text {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #888;
}
.clickable-rows tr {
  cursor: pointer;
}
.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.align-center {
  text-align: center !important;
}

.align-right {
  text-align: right !important;
}

::v-deep .q-table {
  background-color: var(--q-dark) !important;
  color: var(--q-primary) !important;
}

::v-deep .clickable-rows tbody tr:hover {
  background-color: var(--q-primary);
}

::v-deep .white-font .q-field__native,
::v-deep .white-font .q-field__label {
  color: white !important;
}
</style>
