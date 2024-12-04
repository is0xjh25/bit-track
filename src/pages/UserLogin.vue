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
        <h3 class="text-primary">BitTrack • Login</h3>
        <q-form @submit.prevent="handleLogin">
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
            label="Log In"
            type="submit"
            color="primary"
            class="full-width q-my-xs"
          />
        </q-form>

        <div class="action-buttons row justify-between q-my-xs">
          <q-btn
            label="Sign Up"
            @click="redirectToSignup"
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
import { ref } from "vue";
import { supabase } from "../supabaseClient";
import { useRouter } from "vue-router";
import { useLogger } from "../composables/useLogger";

export default {
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const isLoading = ref(false);
    const logger = useLogger();

    const handleLogin = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) {
        errorMessage.value = error.message;
        logger.error("Error logging in:", error.message);
      } else {
        logger.info("User logged in successfully.");
        successMessage.value = "Login successful! Redirecting to dashboard...";
        errorMessage.value = "";
        setTimeout(() => {
          router.push("/portfolio");
        }, 2000);
      }
    };

    const redirectToSignup = () => {
      router.push("/signup");
    };

    const handleResetPassword = async () => {
      if (!email.value) {
        errorMessage.value = "Please enter your email to reset the password.";
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
      handleLogin,
      redirectToSignup,
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
