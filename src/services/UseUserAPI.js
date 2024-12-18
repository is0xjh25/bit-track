import { supabase } from "src/supabaseClient";
import { validateParams } from "src/utils/Validator";

export async function fetchUser() {
  try {
    const { data: data, error: error } = await supabase.auth.getUser();

    if (error) throw new Error("Error fetching user data: " + error.message);

    return data.user;
  } catch (error) {
    throw error;
  }
}

export const fetchAsset = async () => {
  try {
    const { data: data, error: error } = await supabase
      .from("Portfolio")
      .select("quantity, crypto_id, Crypto(name)");

    if (error)
      throw new Error("Error fetching portfolio data: " + error.message);

    return data;
  } catch (error) {
    throw error;
  }
};

export const addAsset = async (params) => {
  try {
    const { crypto_id, quantity } = validateParams("addAsset", params);

    const { error } = await supabase.from("Portfolio").insert({
      crypto_id,
      quantity,
    });

    if (error) throw new Error("Error adding portfolio: " + error.message);
  } catch (error) {
    throw error;
  }
};

export const updateAsset = async (params) => {
  try {
    const { crypto_id, quantity } = validateParams("updateAsset", params);

    const { error } = await supabase
      .from("Portfolio")
      .update({ quantity })
      .eq("crypto_id", crypto_id);

    if (error)
      throw new Error("Error updating asset quantity: " + error.message);
  } catch (error) {
    throw error;
  }
};

export const removeAsset = async (params) => {
  try {
    const { crypto_id } = validateParams("removeAsset", params);

    const { error } = await supabase
      .from("Portfolio")
      .delete()
      .eq("crypto_id", crypto_id);

    if (error) throw new Error("Error removing portfolio: " + error.message);
  } catch (error) {
    throw error;
  }
};

export async function fetchCryptoList() {
  try {
    const { data, error } = await supabase.from("Crypto").select("id, name");

    if (error) {
      throw new Error("Error fetching cryptocurrencies from the database.");
    }

    return data;
  } catch (error) {
    throw error;
  }
}
