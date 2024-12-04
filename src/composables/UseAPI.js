import axios from "axios";
import { supabase } from "/src/supabase";

export async function fetchCryptoMarket(page = 1) {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page,
        },
      }
    );
    return response.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
    }));
  } catch (error) {
    console.error("Error fetching crypto market data:", error.message);
    throw new Error(
      "Could not fetch crypto market data. Please try again later."
    );
  }
}

export async function fetchCryptoPriceById(cryptoId, currency = "usd") {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: cryptoId.toLowerCase(),
          vs_currencies: currency,
        },
      }
    );
    const priceData = response.data[cryptoId.toLowerCase()];
    if (priceData) {
      return priceData[currency];
    } else {
      console.warn(
        `Crypto ID '${cryptoId}' not found or unsupported currency '${currency}'.`
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error.message);
    return null;
  }
}

// Example Supabase function to fetch user data
export async function fetchUserData(userId) {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("id", userId);

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }
  return data;
}

// Fetch user assets
export const fetchUserAssets = async (assets, errorMessage, cryptoStore) => {
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

    updatePricesAndValues(assets, cryptoStore);
  } catch (error) {
    errorMessage.value = error.message;
  }
};

export const updatePricesAndValues = (assets, cryptoStore) => {
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

export const addUserAsset = async (newAsset, assets, errorMessage, showEntryForm, fetchUserAssets) => {
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
      await fetchUserAssets(assets, errorMessage, cryptoStore);
      newAsset.value = { crypto_id: null, quantity: 0 };
      showEntryForm.value = false;
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};