<template>
  <div class="portfolio-container">
    <h3>Your Portfolio</h3>
    <p>Manage your cryptocurrency portfolio here.</p>

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
              <th @click="sortAssets('current_price')" v-show="!isSmallScreen">
                Price
              </th>
              <th @click="sortAssets('quantity')" v-show="!isSmallScreen">
                Quantity
              </th>
              <th @click="sortAssets('current_value')">Value</th>
              <th v-show="!isSmallScreen">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(asset, index) in sortedAssets" :key="index">
              <td>{{ asset.crypto_name }}</td>
              <td v-show="!isSmallScreen">
                {{ asset.current_price || "Loading..." }}
              </td>
              <td v-show="!isSmallScreen">
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
              <td v-show="!isSmallScreen">
                <div class="action-buttons">
                  <q-btn
                    v-if="!asset.isEditing"
                    color="primary"
                    icon="edit"
                    @click="enableEditMode(asset)"
                    class="edit-btn"
                  />
                  <q-btn
                    v-else
                    color="primary"
                    icon="save"
                    @click="saveQuantity(asset)"
                    class="save-btn"
                  />
                  <q-btn
                    color="negative"
                    icon="delete"
                    @click="removeAsset(asset.crypto_id)"
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
              @click="showEntryForm = false"
            />
            <q-btn label="Add" color="primary" @click="addAsset" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <div v-if="isLoading" class="loading-message">
      Loading portfolio data...
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <p class="attribution-text">All crypto prices are provided by CoinGecko.</p>
  </div>
</template>

<script>
import { supabase } from "/src/supabaseClient.js";
import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

export default {
  data() {
    return {
      userEmail: "",
      assets: [],
      cryptos: [],
      newAsset: {
        crypto_id: null,
        quantity: 0,
      },
      showEntryForm: false,
      totalValue: 0,
      isSmallScreen: false,
      sortColumn: "crypto_name",
      sortOrder: "asc",
      refreshInterval: null,
      isLoading: true,
      errorMessage: "",
    };
  },
  computed: {
    availableCryptos() {
      const existingCryptoIds = this.assets.map((asset) => asset.crypto_id);
      return this.cryptos.filter(
        (crypto) => !existingCryptoIds.includes(crypto.id)
      );
    },
    sortedAssets() {
      return [...this.assets].sort((a, b) => {
        let modifier = this.sortOrder === "asc" ? 1 : -1;
        if (a[this.sortColumn] < b[this.sortColumn]) return -1 * modifier;
        if (a[this.sortColumn] > b[this.sortColumn]) return 1 * modifier;
        return 0;
      });
    },
  },
  async created() {
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
    await this.checkLoginStatus();
    await this.fetchCryptos();
    this.refreshInterval = setInterval(() => {
      this.fetchUserAssets();
    }, 60000);
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        this.userEmail = session.user.email;
        this.fetchUserAssets();
      } else if (event === "SIGNED_OUT") {
        this.userEmail = "";
        this.assets = [];
        this.totalValue = 0;
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreenSize);
    clearInterval(this.refreshInterval);
  },
  methods: {
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 600;
    },
    async checkLoginStatus() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          this.userEmail = user.email;
          await this.fetchUserAssets();
        }
      } catch (error) {
        this.errorMessage = "Error checking login status.";
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUserAssets() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError)
          throw new Error("Error fetching user information from Supabase.");

        const userId = user?.id;
        if (!userId) {
          this.errorMessage = "User not found. Please log in.";
          this.isLoading = false;
          return;
        }

        const { data: portfolioData, error: portfolioError } = await supabase
          .from("Portfolio")
          .select("quantity, crypto_id, Crypto(name)")
          .eq("user_id", userId);

        if (portfolioError)
          throw new Error("Error fetching portfolio data from Supabase.");

        const cryptoIds = portfolioData.map((item) =>
          item.Crypto?.name.toLowerCase()
        );

        try {
          const response = await axios.get(COINGECKO_API, {
            params: { ids: cryptoIds.join(","), vs_currencies: "usd" },
            timeout: 5000,
          });

          this.assets = portfolioData.map((item) => {
            const name = item.Crypto?.name || "Unknown";
            const quantity = item.quantity;
            const currentPrice = response.data[name.toLowerCase()]?.usd || 0;
            const currentValue = quantity * currentPrice;

            return {
              crypto_name: name,
              quantity,
              crypto_id: item.crypto_id,
              current_price: currentPrice.toFixed(2),
              current_value: currentValue.toFixed(2),
              isEditing: false,
            };
          });

          this.calculateTotalValue();
        } catch (axiosError) {
          if (!axiosError.response) {
            console.log("!!!");
            this.errorMessage =
              "Network error: Unable to fetch data due to a CORS policy issue or no internet connection.";
            this.isLoading = false;
            console.log("!!!");
          } else if (axiosError.code === "ECONNABORTED") {
            this.errorMessage = "Request timed out. Please try again later.";
          } else {
            this.errorMessage = "Failed to load cryptocurrency data.";
          }
        }
      } catch (error) {
        this.errorMessage = error.message;
        console.log(this.errorMessage);
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    calculateTotalValue() {
      this.totalValue = this.assets
        .reduce((total, asset) => total + parseFloat(asset.current_value), 0)
        .toFixed(2);
    },
    async fetchCryptos() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const { data, error } = await supabase
          .from("Crypto")
          .select("id, name");
        if (error) {
          this.errorMessage = "Error fetching cryptocurrencies.";
        } else {
          this.cryptos = data;
        }
      } catch (error) {
        this.errorMessage = "Error fetching cryptocurrencies from Supabase.";
      } finally {
        this.isLoading = false;
      }
    },
    async addAsset() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;
        if (!userId) return;

        const { error } = await supabase.from("Portfolio").insert({
          user_id: userId,
          crypto_id: this.newAsset.crypto_id,
          quantity: this.newAsset.quantity,
        });

        if (error) {
          this.errorMessage = "Error adding new asset.";
        } else {
          this.fetchUserAssets();
          this.newAsset = { crypto_id: null, quantity: 0 };
          this.showEntryForm = false;
        }
      } catch (error) {
        this.errorMessage = "Error adding new asset to Supabase.";
      } finally {
        this.isLoading = false;
      }
    },
    enableEditMode(asset) {
      asset.isEditing = true;
    },
    async saveQuantity(asset) {
      asset.isEditing = false;
      await this.updateAssetQuantity(asset.crypto_id, asset.quantity);
      this.fetchUserAssets();
    },
    async updateAssetQuantity(crypto_id, quantity) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;
        if (!userId) return;

        const { error } = await supabase
          .from("Portfolio")
          .update({ quantity })
          .eq("user_id", userId)
          .eq("crypto_id", crypto_id);
        if (error) {
          this.errorMessage = "Error updating asset quantity.";
        }
      } catch (error) {
        this.errorMessage = "Error updating asset quantity in Supabase.";
      } finally {
        this.isLoading = false;
      }
    },
    async removeAsset(crypto_id) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;
        if (!userId) return;

        const { error } = await supabase
          .from("Portfolio")
          .delete()
          .eq("user_id", userId)
          .eq("crypto_id", crypto_id);
        if (error) {
          this.errorMessage = "Error removing asset.";
        } else {
          this.fetchUserAssets();
        }
      } catch (error) {
        this.errorMessage = "Error removing asset from Supabase.";
      } finally {
        this.isLoading = false;
      }
    },
    sortAssets(column) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortColumn = column;
        this.sortOrder = "asc";
      }
    },
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
