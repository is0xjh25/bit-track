import { supabase } from "src/supabaseClient";

export async function fetchUser() {
  try {
    const { data: data, error: error } = await supabase.auth.getUser();

    if (error) throw new Error("Error fetching user data.");

    return data.user;
  } catch (error) {
    console.error("Unexpected error fetching user data:", error.message);
    return null;
  }
}

export const fetchPortfolio = async () => {
  try {
    const { data: data, error: error } = await supabase
      .from("Portfolio")
      .select("quantity, crypto_id, Crypto(name)");

    if (error) throw new Error("Error fetching portfolio data.");

    return data;
  } catch (error) {
    throw new Error(
      error.message || "Unexpected error fetching portfolio data"
    );
  }
};

export const addPortfolio = async (params) => {
  const { crypto_id, quantity } = params;

  if (!crypto_id || !quantity) {
    throw new Error("Missing required parameters: crypto_id, quantity.");
  }

  try {
    const { error } = await supabase.from("Portfolio").insert({
      crypto_id,
      quantity,
    });

    if (error) {
      throw new Error("Error adding portfolio: " + error.message);
    }
  } catch (error) {
    console.error("Error in addPortfolio:", error.message);
    throw new Error(
      error.message || "Unexpected error occurred while adding to portfolio."
    );
  }
};

export const updatePortfolio = async (params) => {
  const { crypto_id, quantity } = params;

  if (!crypto_id || !quantity) {
    throw new Error("Missing required parameters: crypto_id, quantity");
  }

  try {
    const { error } = await supabase
      .from("Portfolio")
      .update({ quantity })
      .eq("crypto_id", crypto_id);

    if (error) throw new Error("Error updating asset quantity.");
  } catch (error) {
    console.error("Error in addPortfolio:", error.message);
    throw new Error(
      error.message || "Unexpected error occurred while updating portfolio."
    );
  }
};

export const removePortfolio = async (params) => {
  const { crypto_id } = params;

  if (!crypto_id) {
    throw new Error("Missing required parameters: crypto_id, quantity");
  }

  try {
    const { error } = await supabase
      .from("Portfolio")
      .delete()
      .eq("crypto_id", crypto_id);

    if (error) {
      throw new Error("Error removing portfolio: " + error.message);
    }
  } catch (error) {
    console.error("Error in removePortfolio:", error.message);
    throw new Error(
      error.message ||
        "Unexpected error occurred while removing from portfolio."
    );
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
    console.error("Error in fetchCryptosFromDB:", error.message);
    throw new Error(error.message || "Unexpected error occurred.");
  }
}
