<template>
  <q-page
    class="flex flex-center items-center q-gutter-sm q-pa-md"
    style="
      max-width: 1200px;
      max-height: 95vh;
      margin: auto;
      flex-direction: column;
    "
  >
    <q-card
      v-if="$q.screen.gt.xs"
      flat
      class="q-pa-md"
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        width: 25vw;
        margin: auto;
      "
    >
      <q-img src="/bit-track-logo.png" :ratio="1" />
    </q-card>

    <q-card
      flat
      class="q-pa-md"
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        margin: auto;
      "
    >
      <q-card-section>
        <h3 class="text-primary">BitTrack</h3>
        <h3 class="text-primary">Reset Password</h3>
        <q-form @submit.prevent="handlePasswordUpdate">
          <q-input
            v-model="newPassword"
            type="password"
            label="New Password"
            outlined
            class="q-my-xs"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) =>
                val.length >= 8 || 'Password must be at least 8 characters',
            ]"
            color="primary"
            bg-color="secondary"
          />
          <q-input
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            outlined
            class="q-my-xs"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val === newPassword || 'Passwords must match',
            ]"
            color="primary"
            bg-color="secondary"
          />
          <q-btn
            label="Reset Password"
            type="submit"
            color="primary"
            class="full-width q-my-xs"
            :loading="isLoading"
            :disable="isLoading"
          />
        </q-form>

        <div class="action-buttons row justify-between q-my-xs">
          <q-btn
            label="Log In"
            @click="redirectToLogin"
            color="secondary"
            flat
          />
          <q-btn
            label="Sign Up"
            @click="redirectToSignup"
            color="secondary"
            flat
          />
        </div>
        <q-banner v-if="errorMessage" class="error q-my-xs" color="negative">
          {{ errorMessage }}
        </q-banner>
        <q-banner
          v-if="successMessage"
          class="success q-my-xs"
          color="positive"
        >
          {{ successMessage }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabaseClient";
import { useLogger } from "/src/composables/useLogger";

export default {
  setup() {
    const router = useRouter();
    const newPassword = ref("");
    const confirmPassword = ref("");
    const isLoading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const logger = useLogger();

    const checkAuth = async () => {
      const accessToken = router.currentRoute.value.query.access_token;
      const refreshToken = router.currentRoute.value.query.refresh_token;

      if (!accessToken || !refreshToken) {
        errorMessage.value =
          "Invalid or expired link. Please request a new reset link.";
        logger.error("Invalid or expired link.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data) {
          errorMessage.value =
            "Session expired or invalid. Please request a new reset link.";
          logger.error("Session expired or invalid.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        logger.error("Error setting session:", error.message);
        errorMessage.value = "An error occurred. Please try again later.";
      }
    };

    const handlePasswordUpdate = async () => {
      if (!newPassword.value || !confirmPassword.value) {
        errorMessage.value = "Both password fields are required.";
        logger.warn("Password fields are required.");
        return;
      }
      if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match.";
        logger.warn("Passwords do not match.");
        return;
      }

      isLoading.value = true;

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword.value,
        });

        if (error) {
          errorMessage.value =
            error.message ||
            "An error occurred while resetting the password. Please try again.";
          logger.error("Error updating password:", error.message);
        } else {
          successMessage.value = "Password has been reset successfully!";
          setTimeout(() => {
            redirectToLogin();
          }, 2000);
        }
      } catch (error) {
        errorMessage.value =
          "An unexpected error occurred. Please try again later.";
        logger.error("Error updating password:", error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const redirectToLogin = () => {
      router.push("/login");
    };

    const redirectToSignup = () => {
      router.push("/signup");
    };

    onMounted(() => {
      checkAuth();
    });

    return {
      newPassword,
      confirmPassword,
      isLoading,
      errorMessage,
      successMessage,
      handlePasswordUpdate,
      redirectToLogin,
      redirectToSignup,
    };
  },
};
</script>

<style scoped>
.error {
  color: var(--q-negative);
}

.success {
  color: var(--q-positive);
}
</style>
