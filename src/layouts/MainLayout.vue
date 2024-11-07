<template>
  <q-layout view="lHh Lpr lFf" class="high-tech-theme">
    <q-header v-if="showNavbar" elevated class="header">
      <q-toolbar>
        <q-btn
          v-if="isMobileOrTablet"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> BitTrack </q-toolbar-title>

        <div v-if="!isMobileOrTablet" class="desktop-nav">
          <q-btn
            flat
            dense
            label="Portfolio"
            :class="{ 'active-btn': isActive('/portfolio') }"
            @click="navigateTo('/portfolio')"
          />
          <q-btn
            flat
            dense
            label="Market"
            :class="{ 'active-btn': isActive('/market') }"
            @click="navigateTo('/market')"
          />
          <q-btn
            flat
            dense
            label="AI Consultant"
            :class="{ 'active-btn': isActive('/ai-consultant') }"
            @click="navigateTo('/ai-consultant')"
          />
        </div>

        <q-btn
          flat
          dense
          icon="logout"
          label="Sign Out"
          class="signout-btn"
          @click="signOut"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isMobileOrTablet && showNavbar"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <div class="drawer-content">
        <div class="drawer-list">
          <q-item-label header style="color: var(--q-dark)"
            >BitTrack</q-item-label
          >

          <q-item
            clickable
            v-ripple
            @click="navigateTo('/portfolio')"
            :class="{ 'active-drawer-item': isActive('/portfolio') }"
          >
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" />
            </q-item-section>
            <q-item-section>Portfolio</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/market')"
            :class="{ 'active-drawer-item': isActive('/market') }"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>Market</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="navigateTo('/ai-consultant')"
            :class="{ 'active-drawer-item': isActive('/ai-consultant') }"
          >
            <q-item-section avatar>
              <q-icon name="lightbulb" />
            </q-item-section>
            <q-item-section>AI Consultant</q-item-section>
          </q-item>
        </div>

        <div class="drawer-list">
          <q-item
            clickable
            v-ripple
            tag="a"
            href="https://github.com/is0xjh25"
            target="_blank"
            class="drawer-footer-link"
          >
            <q-item-section avatar>
              <q-icon name="code" />
            </q-item-section>
            <q-item-section>is0xjh25</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            tag="a"
            href="mailto:is0.jimhsiao@gmail.com"
            class="drawer-footer-link"
          >
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>is0.jimhsiao@gmail.com</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            tag="a"
            href="https://www.coingecko.com/"
            target="_blank"
            class="drawer-footer-link"
          >
            <q-item-section avatar>
              <q-icon name="link" />
            </q-item-section>
            <q-item-section>API Provided by CoinGecko</q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <p style="color: var(--q-dark)">&copy; 2024 BitTrack</p>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="!isMobileOrTablet && showNavbar" class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <p>
            GitHub:
            <a
              href="https://github.com/is0xjh25"
              target="_blank"
              class="footer-link"
              >is0xjh25</a
            >
          </p>
        </div>
        <div class="footer-section">
          <p>
            API Provided by
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              class="footer-link"
              >CoinGecko</a
            >
          </p>
        </div>
        <div class="footer-section">
          <p>
            Contact:
            <a href="mailto:is0.jimhsiao@gmail.com" class="footer-link"
              >is0.jimhsiao@gmail.com</a
            >
          </p>
        </div>
        <div class="footer-section">
          <p>&copy; 2024 BitTrack - All Rights Reserved</p>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { supabase } from "../supabaseClient";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const isMobileOrTablet = computed(() => $q.screen.lt.md);
const navbarRoutes = ["/market", "/portfolio", "/ai-consultant"];
const showNavbar = computed(() => navbarRoutes.includes(route.path));

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(routePath) {
  leftDrawerOpen.value = false;
  router.push(routePath);
}

function signOut() {
  supabase.auth.signOut().then(({ error }) => {
    if (!error) router.push("/login");
  });
}

function isActive(targetRoute) {
  return route.path === targetRoute;
}
</script>

<style scoped>
.high-tech-theme {
  background-color: var(--q-dark);
  color: var(--q-primary);
}

.header {
  background-color: var(--q-primary);
  color: var(--q-dark);
}

.desktop-nav {
  display: flex;
  gap: 30px;
  margin-right: 60px;
}

.active-btn {
  color: var(--q-secondary) !important;
  font-weight: bold;
}

.active-drawer-item {
  background-color: rgba(var(--q-dark), 0.2);
  border-left: 3px solid var(--q-positive);
}

.footer {
  background-color: var(--q-dark);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--q-primary);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  justify-items: center;
}

.footer-section {
  text-align: center;
}

.footer-link {
  color: var(--q-accent);
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
  color: var(--q-accent);
}

.drawer-footer-link {
  color: var(--q-primary);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.drawer-list {
  flex: 1;
}

.drawer-list:first-of-type {
  display: flex;
  flex-direction: column;
  justify-self: start;
}

.drawer-list:last-of-type {
  display: flex;
  flex-direction: column;
  justify-content: end;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
