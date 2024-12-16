import axios from "axios";

const COINGECKO_MARKET_URL = import.meta.env.VITE_COINGECKO_MARKET_URL;
const COINGECKO_PRICE_URL = import.meta.env.VITE_COINGECKO_PRICE_URL;

export async function fetchCryptoMarket(params = {}) {
  try {
    const defaultParams = {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 10,
      page: 1,
    };

    const finalParams = { ...defaultParams, ...params };

    const response = await axios.get(COINGECKO_MARKET_URL, {
      params: finalParams,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching crypto market data:", error.message);
    throw new Error(
      "Could not fetch crypto market data. Please try again later."
    );
  }
}

export async function fetchCryptoPriceById(params) {
  const { cryptoId, currency = "usd" } = params;

  if (!cryptoId || typeof cryptoId !== "string") {
    console.error("Invalid crypto ID provided. It must be a non-empty string.");
    return null;
  }

  if (!currency || typeof currency !== "string") {
    console.error("Invalid currency provided. It must be a non-empty string.");
    return null;
  }

  try {
    const response = await axios.get(COINGECKO_PRICE_URL, {
      params: {
        ids: cryptoId.toLowerCase(),
        vs_currencies: currency.toLowerCase(),
      },
    });

    const priceData = response.data[cryptoId.toLowerCase()];
    if (priceData) {
      return priceData[currency.toLowerCase()];
    } else {
      console.warn(
        `Crypto ID '${cryptoId}' not found or unsupported currency '${currency}'.`
      );
      return null;
    }
  } catch (error) {
    console.error(`Error fetching price for '${cryptoId}':`, error.message);
    return null;
  }
}
