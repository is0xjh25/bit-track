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
import { useLogger } from "src/composables/useLogger";
import { validateParams } from "src/utils/Validator";
import { checkAuth, updatePassword } from "src/services/UseAuthAPI";

export default {
  setup() {
    const router = useRouter();
    const newPassword = ref("");
    const confirmPassword = ref("");
    const isLoading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const logger = useLogger();

    const handleCheckAuth = async () => {
      const accessToken = router.currentRoute.value.query.access_token;
      const refreshToken = router.currentRoute.value.query.refresh_token;

      try {
        const params = validateParams("checkAuth", {
          accessToken,
          refreshToken,
        });
        await checkAuth(params.accessToken, params.refreshToken);
      } catch (error) {
        logger.error("Error in handleCheckAuth:", error.message);
        errorMessage.value = "Error: Invalid or expired token.";
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    const handlePasswordUpdate = async () => {
      isLoading.value = true;
      successMessage.value = "";

      try {
        const params = validateParams("updatePassword", {
          password: newPassword.value,
          confirmPassword: confirmPassword.value,
        });

        if (params.password !== params.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const message = await updatePassword(params.password);
        successMessage.value = message;

        setTimeout(() => {
          redirectToLogin();
        }, 2000);
      } catch (error) {
        errorMessage.value = error.message;
        logger.error("Error in handlePasswordUpdate:", error.message);
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
      handleCheckAuth();
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
