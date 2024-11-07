// src/services/cryptoAPI.js

import axios from "axios";

/**
 * Fetches a list of cryptocurrencies from the CoinGecko market data API.
 * @param {number} page - The page number for pagination (default is 1).
 * @returns {Promise<Array>} - An array of cryptocurrency data with id, name, symbol, current price, 24h price change, and market cap.
 * @throws Will throw an error if the request fails.
 */
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

    // Return essential data for each coin
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

/**
 * Fetches the current price of a specific cryptocurrency by its CoinGecko ID.
 * @param {string} cryptoId - The CoinGecko ID of the cryptocurrency (e.g., "bitcoin", "ethereum").
 * @param {string} currency - The currency to get the price in (default is "usd").
 * @returns {Promise<number|null>} - Returns the current price of the cryptocurrency in the specified currency, or null if an error occurs.
 */
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

    // Check if the response contains the desired data
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
