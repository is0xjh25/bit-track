import axios from "axios";
import { validateParams } from "src/utils/Validator";

const COINGECKO_MARKET_URL = import.meta.env.VITE_COINGECKO_MARKET_URL;
const COINGECKO_PRICE_URL = import.meta.env.VITE_COINGECKO_PRICE_URL;

export async function fetchCryptoMarket(params) {
  try {
    const defaultParams = {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 10,
      page: 1,
    };

    const finalParams = validateParams("cryptoMarket", {
      ...defaultParams,
      ...params,
    });

    const response = await axios.get(COINGECKO_MARKET_URL, {
      params: finalParams,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchCryptoPriceById(params) {
  try {
    const { cryptoId, currency = "usd" } = validateParams(
      "cryptoPriceById",
      params
    );

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
    throw error;
  }
}
