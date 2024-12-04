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
        <h3 class="text-primary">BitTrack • Signup</h3>
        <q-form @submit.prevent="handleSignUp">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            class="q-my-xs"
            :rules="[(val) => !!val || 'Email is required']"
            color="primary"
            bg-color="secondary"
          />
          <q-input
            v-model="password"
            type="password"
            label="Password"
            outlined
            class="q-my-xs"
            :rules="[(val) => !!val || 'Password is required']"
            color="primary"
            bg-color="secondary"
          />
          <q-btn
            label="Sign Up"
            type="submit"
            color="primary"
            class="full-width q-my-xs"
          />
        </q-form>

        <q-banner v-if="errorMessage" class="error q-my-xs" color="negative">
          {{ errorMessage }}
        </q-banner>

        <div class="action-buttons row justify-between q-my-xs">
          <q-btn
            label="Log In"
            @click="redirectToLogin"
            color="secondary"
            flat
          />
          <q-btn
            :label="isLoading ? 'Sending...' : 'Reset Password?'"
            :loading="isLoading"
            :disable="isLoading"
            @click="handleResetPassword"
            color="secondary"
            flat
          />
        </div>

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
import { ref } from "vue";
import { supabase } from "../supabaseClient";
import { useRouter } from "vue-router";
import { useLogger } from "src/composables/useLogger";

export default {
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const isLoading = ref(false);
    const logger = useLogger();

    const handleSignUp = async () => {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) {
        errorMessage.value = error.message;
        logger.error("Error signing up:", error.message);
      } else {
        successMessage.value = "Sign-up successful! Redirecting to login...";
        errorMessage.value = "";
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    const redirectToLogin = () => {
      router.push("/login");
    };

    const handleResetPassword = async () => {
      if (!email.value) {
        errorMessage.value = "Please enter your email to reset the password.";
        logger.warn("Email is required to reset the password.");
        return;
      }

      isLoading.value = true;
      const { error } = await supabase.auth.resetPasswordForEmail(email.value);

      if (error) {
        errorMessage.value = error.message;
        logger.error("Error sending password reset email:", error.message);
      } else {
        successMessage.value = "Password reset email has been sent.";
        errorMessage.value = "";
      }

      isLoading.value = false;
    };

    return {
      email,
      password,
      errorMessage,
      successMessage,
      isLoading,
      handleSignUp,
      redirectToLogin,
      handleResetPassword,
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
