<template>
  <div class="portfolio-container">
    <h3>Your Portfolio</h3>
    <p>Manage your cryptocurrency portfolio here.</p>
    <div v-if="isLoading" class="loading-message">
      Loading portfolio data...
    </div>
    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-else>
      <div class="user-info">
        <p>
          <strong>Hi, </strong>
          <span style="color: var(--q-secondary)">{{ userEmail }}</span>
        </p>
      </div>

      <div>
        <div class="total-value">
          <p>
            <strong>Total Portfolio Value: </strong>
            <span style="color: var(--q-secondary)">{{ totalValue }} USD</span>
          </p>
        </div>
        <div class="button-container">
          <q-btn
            label="Add Asset"
            color="primary"
            icon="wallet"
            @click="showEntryForm = true"
          />
        </div>
        <div class="portfolio-wrapper">
          <table class="portfolio-table">
            <thead>
              <tr>
                <th @click="handleSortAssets('crypto_name')">Crypto</th>
                <th
                  @click="handleSortAssets('current_price')"
                  v-show="isLargeScreen"
                >
                  Price
                </th>
                <th
                  @click="handleSortAssets('quantity')"
                  v-show="isLargeScreen"
                >
                  Quantity
                </th>
                <th @click="handleSortAssets('current_value')">Value</th>
                <th v-show="isLargeScreen">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(asset, index) in sortedAssets" :key="index">
                <td>{{ asset.crypto_name }}</td>
                <td v-show="isLargeScreen">
                  {{ asset.current_price || "Loading..." }}
                </td>
                <td v-show="isLargeScreen">
                  <input
                    type="number"
                    v-model.number="asset.quantity"
                    :disabled="!asset.isEditing"
                    :class="{
                      'quantity-input': true,
                      'primary-text inactive-input': !asset.isEditing,
                    }"
                    min="0"
                    step="1"
                  />
                </td>
                <td>{{ asset.current_value || "Loading..." }}</td>
                <td v-show="isLargeScreen">
                  <div class="action-buttons">
                    <q-btn
                      v-if="!asset.isEditing"
                      color="primary"
                      icon="edit"
                      @click="handleEditMode(asset)"
                      class="edit-btn"
                    />
                    <q-btn
                      v-else
                      color="primary"
                      icon="save"
                      @click="handleSaveQuantity(asset)"
                      class="save-btn"
                    />
                    <q-btn
                      color="negative"
                      icon="delete"
                      @click="handleRemoveAsset(asset.crypto_id)"
                      class="remove-btn"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <q-dialog v-model="showEntryForm" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">Add New Asset</div>
            </q-card-section>

            <q-card-section class="q-pt-none popup-form">
              <div class="form-row">
                <label for="crypto">Select Crypto:</label>
                <select v-model="newAsset.crypto_id" required>
                  <option
                    v-for="crypto in availableCryptos"
                    :value="crypto.id"
                    :key="crypto.id"
                  >
                    {{ crypto.name }}
                  </option>
                </select>
              </div>

              <div class="form-row">
                <label for="quantity">Quantity:</label>
                <input
                  type="number"
                  v-model="newAsset.quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </q-card-section>
            <q-card-actions align="center">
              <q-btn
                label="Cancel"
                color="negative"
                @click="handleCloseEntryForm"
              />
              <q-btn
                label="Add"
                color="primary"
                @click="handleAddAsset"
                :disable="newAsset.quantity <= 0"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
    <p class="attribution-text">All crypto prices are provided by CoinGecko.</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useCryptoStore } from "src/stores/cryptoDataStore.js";
import {
  fetchUser,
  fetchPortfolio,
  addPortfolio,
  removePortfolio,
  updatePortfolio,
  fetchCryptoList,
} from "src/services/UseUserAPI";

export default {
  setup() {
    const cryptoStore = useCryptoStore();
    const userEmail = ref("");
    const assets = ref([]);
    const cryptos = ref([]);
    const newAsset = ref({
      crypto_id: null,
      quantity: 0,
    });
    const showEntryForm = ref(false);
    const sortColumn = ref("crypto_name");
    const sortOrder = ref("asc");
    const errorMessage = ref("");
    const isLoading = ref(true);
    const windowWidth = ref(window.innerWidth);
    const isLargeScreen = computed(() => windowWidth.value > 768);

    // Methods
    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth;
    };
    const logger = useLogger();

    const checkLoginStatus = async () => {
      try {
        const user = await fetchUser();
        if (!user) {
          throw new Error("User not logged in.");
        }

        userEmail.value = user.email;

        await getAssets();
      } catch (error) {
        console.error("Error checking login status:", error.message);
        errorMessage.value = error.message || "Error checking login status.";
      }
    };

    const getCryptoList = async () => {
      try {
        cryptos.value = await fetchCryptoList();
      } catch (error) {
        errorMessage.value =
          error.message || "Error fetching cryptocurrencies.";
      }
    };

    const getAssets = async () => {
      const portfolio = await fetchPortfolio();
      try {
        assets.value = portfolio.map((item) => ({
          crypto_name: item.Crypto?.name || "Unknown",
          quantity: item.quantity || 0,
          crypto_id: item.crypto_id || null,
          current_price: 0,
          current_value: 0,
          isEditing: false,
        }));
        updatePricesAndValues();
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const updatePricesAndValues = () => {
      assets.value = assets.value.map((asset) => {
        const currentPrice = cryptoStore.getPriceByName(asset.crypto_name) || 0;
        const currentValue = asset.quantity * currentPrice;
        return {
          ...asset,
          current_price: currentPrice.toFixed(2),
          current_value: currentValue.toFixed(2),
        };
      });
    };

    const handleCloseEntryForm = () => {
      showEntryForm.value = false;
      newAsset.value = { crypto_id: null, quantity: 0 };
    };

    const handleAddAsset = async () => {
      const params = {
        crypto_id: newAsset.value.crypto_id,
        quantity: newAsset.value.quantity,
      };
      try {
        await addPortfolio(params);
        getAssets();
        handleCloseEntryForm;
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const handleSaveQuantity = async (asset) => {
      try {
        asset.isEditing = false;
        const params = { crypto_id: asset.crypto_id, quantity: asset.quantity };
        await updatePortfolio(params);
        getAssets();
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const handleRemoveAsset = async (crypto_id) => {
      const params = { crypto_id: crypto_id };
      try {
        await removePortfolio(params);
        getAssets();
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const handleEditMode = (asset) => {
      asset.isEditing = true;
    };

    const handleSortAssets = (column) => {
      if (sortColumn.value === column) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortColumn.value = column;
        sortOrder.value = "asc";
      }
    };

    // Computed Properties
    const availableCryptos = computed(() => {
      const existingCryptoIds = assets.value.map((asset) => asset.crypto_id);
      return cryptos.value.filter(
        (crypto) => !existingCryptoIds.includes(crypto.id)
      );
    });

    const totalValue = computed(() => {
      return assets.value
        .reduce(
          (total, asset) => total + parseFloat(asset.current_value || 0),
          0
        )
        .toFixed(2);
    });

    const sortedAssets = computed(() => {
      return [...assets.value].sort((a, b) => {
        let modifier = sortOrder.value === "asc" ? 1 : -1;
        if (a[sortColumn.value] < b[sortColumn.value]) return -1 * modifier;
        if (a[sortColumn.value] > b[sortColumn.value]) return 1 * modifier;
        return 0;
      });
    });

    // Lifecycle Hooks
    onMounted(() => {
      (async () => {
        try {
          isLoading.value = true;
          await getCryptoList();
          await checkLoginStatus();
        } catch (error) {
          console.error("Error during initialization:", error);
        } finally {
          isLoading.value = false;
        }
      })();

      window.addEventListener("resize", updateWindowWidth);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateWindowWidth);
    });

    watch(
      availableCryptos,
      (newList) => {
        if (newList.length > 0 && !newAsset.value.crypto_id) {
          newAsset.value.crypto_id = newList[0].id;
        }
      },
      { immediate: true }
    );

    // Watchers
    watch(
      () => [cryptoStore.cryptocurrencies, cryptoStore.loading],
      () => {
        if (!cryptoStore.loading) {
          updatePricesAndValues();
        }
      },
      { deep: true }
    );

    return {
      userEmail,
      assets,
      cryptos,
      newAsset,
      showEntryForm,
      totalValue,
      isLargeScreen,
      availableCryptos,
      sortedAssets,
      errorMessage,
      isLoading,
      handleAddAsset,
      handleSortAssets,
      handleEditMode,
      handleSaveQuantity,
      handleRemoveAsset,
      handleCloseEntryForm,
    };
  },
};
</script>

<style scoped>
.portfolio-container {
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

.user-info,
.total-value {
  text-align: left;
}

.loading-message,
.error-message {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 25px;
  color: var(--q-secondary);
}

.error-message {
  color: var(--q-negative);
}

.portfolio-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  max-height: 60vh;
}

.portfolio-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.portfolio-table th,
.portfolio-table td {
  padding: 10px;
  border: 1px solid var(--q-secondary);
  text-align: center;
}

.portfolio-table th {
  background-color: var(--q-secondary);
  cursor: pointer;
}

.primary-text {
  color: var(--q-primary);
}

.button-container {
  margin: 20px 0;
  align-self: center !important;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.attribution-text {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #888;
}

.quantity-input {
  color: var(--q-primary) !important;
  width: 100px;
  padding: 5px 0;
  text-align: center;
}

.inactive-input {
  color: var(--q-warning) !important;
  background-color: transparent !important;
  border: none !important;
  cursor: default !important;
}
</style>
