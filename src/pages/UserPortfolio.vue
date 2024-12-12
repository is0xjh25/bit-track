<template>
  <div class="portfolio-container">
    <CustomHeading>
      <template #heading>Your Portfolio</template>
      <template #subheading>Manage your cryptocurrency portfolio here.</template>
    </CustomHeading>

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
                <th @click="sortAssets('crypto_name')">Crypto</th>
                <th @click="sortAssets('current_price')" v-show="isLargeScreen">
                  Price
                </th>
                <th @click="sortAssets('quantity')" v-show="isLargeScreen">
                  Quantity
                </th>
                <th @click="sortAssets('current_value')">Value</th>
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
                    <CustomButton
                      v-if="!asset.isEditing"
                      type="edit"
                      customClass="edit-btn"
                      @click="enableEditMode(asset)"
                    />
                    <CustomButton
                      v-else
                      type="save"
                      customClass="save-btn"
                      @click="saveQuantity(asset)"
                    />
                    <CustomButton
                      type="delete"
                      customClass="remove-btn"
                      @click="removeAsset(asset.crypto_id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="attribution-text">All crypto prices are provided by CoinGecko.</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { supabase } from "/src/supabaseClient.js";
import { useCryptoStore } from "/src/stores/cryptoDataStore.js";
import CustomButton from "/src/components/CustomButton.vue";
import CustomHeading from "/src/components/CustomHeading.vue";


export default {
  components: {
    CustomHeading,
    CustomButton,
  },

  setup() {
    const cryptoStore = useCryptoStore();

    // State
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

    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      (async () => {
        try {
          isLoading.value = true; // Start loading
          await fetchCryptos();
          await checkLoginStatus();
        } catch (error) {
          console.error("Error during initialization:", error);
        } finally {
          isLoading.value = false; // End loading
        }
      })();

      window.addEventListener("resize", updateWindowWidth);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateWindowWidth);
    });

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

    // Methods
    const checkLoginStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userEmail.value = user.email;
          await fetchUserAssets();
        }
      } catch (error) {
        errorMessage.value = "Error checking login status.";
      }
    };

    const fetchCryptos = async () => {
      try {
        const { data, error } = await supabase
          .from("Crypto")
          .select("id, name");
        if (error) {
          errorMessage.value = "Error fetching cryptocurrencies.";
        } else {
          cryptos.value = data;
        }
      } catch (error) {
        errorMessage.value = "Error fetching cryptocurrencies from Supabase.";
      }
    };

    const fetchUserAssets = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in.");

        const { data: portfolioData, error: portfolioError } = await supabase
          .from("Portfolio")
          .select("quantity, crypto_id, Crypto(name)")
          .eq("user_id", user.id);

        if (portfolioError) throw new Error("Error fetching portfolio data.");

        assets.value = portfolioData.map((item) => ({
          crypto_name: item.Crypto?.name || "Unknown",
          quantity: item.quantity,
          crypto_id: item.crypto_id,
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

    const addAsset = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in.");

        const { error } = await supabase.from("Portfolio").insert({
          user_id: user.id,
          crypto_id: newAsset.value.crypto_id,
          quantity: newAsset.value.quantity,
        });

        if (error) {
          errorMessage.value = "Error adding new asset.";
        } else {
          await fetchUserAssets();
          newAsset.value = { crypto_id: null, quantity: 0 };
          showEntryForm.value = false;
        }
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const enableEditMode = (asset) => {
      asset.isEditing = true;
    };

    const saveQuantity = async (asset) => {
      asset.isEditing = false;
      await updateAssetQuantity(asset.crypto_id, asset.quantity);
      fetchUserAssets();
    };

    const updateAssetQuantity = async (crypto_id, quantity) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in.");

        const { error } = await supabase
          .from("Portfolio")
          .update({ quantity })
          .eq("user_id", user.id)
          .eq("crypto_id", crypto_id);

        if (error) throw new Error("Error updating asset quantity.");
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const removeAsset = async (crypto_id) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in.");

        const { error } = await supabase
          .from("Portfolio")
          .delete()
          .eq("user_id", user.id)
          .eq("crypto_id", crypto_id);

        if (error) throw new Error("Error removing asset.");
        fetchUserAssets();
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const sortAssets = (column) => {
      if (sortColumn.value === column) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortColumn.value = column;
        sortOrder.value = "asc";
      }
    };

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
      addAsset,
      enableEditMode,
      saveQuantity,
      updateAssetQuantity,
      removeAsset,
      sortAssets,
      errorMessage,
      isLoading,
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
  overflow-y: auto;
}

.portfolio-container::-webkit-scrollbar {
  display: none; 
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
