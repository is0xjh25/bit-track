import { supabase } from "src/supabaseClient";
import { validateParams } from "src/utils/Validator";

export const signUp = async (params) => {
  try {
    const { email, password } = validateParams("signUp", params);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(`Error signing up: ${error.message}`);

    return "Sign-up successful! Please check your email to confirm your account.";
  } catch (error) {
    throw error;
  }
};

export const signInWithPassword = async (params) => {
  try {
    const { email, password } = validateParams("signInWithPassword", params);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`Login failed: ${error.message}`);
    return "Welcome to BitTrack!";
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (params) => {
  try {
    const { email } = validateParams("resetPassword", params);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(`Error sending password reset email: ${error.message}`);
    }

    return "Password reset email has been sent.";
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (params) => {
  try {
    const { password } = validateParams("updatePassword", params);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(
        error.message ||
          "An error occurred while updating the password. Please try again."
      );
    }

    return "Password has been updated successfully!";
  } catch (error) {
    throw error;
  }
};

export const checkAuth = async (params) => {
  try {
    const { accessToken, refreshToken } = validateParams("checkAuth", params);

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data) {
      throw new Error(
        "Session expired or invalid. Please request a new reset link."
      );
    }
  } catch (error) {
    throw error;
  }
};
