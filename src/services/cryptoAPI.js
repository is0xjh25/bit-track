// src/services/cryptoAPI.js

import axios from "axios";

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

    // Ensure that the id field is included for each coin to construct CoinGecko URLs
    return response.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
    }));
  } catch (error) {
    console.error("Error fetching crypto market:", error);
    throw error;
  }
}
