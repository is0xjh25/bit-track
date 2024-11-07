<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="error-code" style="font-size: calc(10vw + 10vh)">404</div>

      <div class="text-h2" style="opacity: 0.4; font-size: calc(2vw + 2vh)">
        Oops. Nothing here...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "ErrorNotFound",
});
</script>

<style scoped>
.error-code {
  font-size: calc(10vw + 10vh); /* Adjusts with screen size */
}
@media (max-width: 600px) {
  .error-code {
    font-size: 20vh; /* Smaller font size on mobile screens */
  }
}
</style>
