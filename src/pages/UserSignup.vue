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
import { supabase } from "../supabaseClient";
import { computed } from "vue";
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
      isLoading: false,
    };
  },
  setup() {
    const $q = useQuasar();
    const isMobileOrTablet = computed(() => $q.screen.lt.md);
    return { isMobileOrTablet };
  },
  methods: {
    async handleSignUp() {
      const { error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = "Sign-up successful! Redirecting to login...";
        this.errorMessage = "";
        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
      }
    },
    redirectToLogin() {
      this.$router.push("/login");
    },
    async handleResetPassword() {
      if (!this.email) {
        this.errorMessage = "Please enter your email to reset the password.";
        return;
      }

      this.isLoading = true;
      const { error } = await supabase.auth.resetPasswordForEmail(this.email);

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = "Password reset email has been sent.";
        this.errorMessage = "";
      }

      this.isLoading = false;
    },
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
