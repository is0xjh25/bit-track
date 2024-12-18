<template>
  <div class="CustomHeadingContainer">
    <h3 class="CustomHeading">
      <slot name="heading"></slot>
    </h3>
    <h4 class="SubHeading">
      <slot name="subheading"></slot>
    </h4>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CustomHeading", 
  setup() {
    return {};
  },
});
</script>

<style scoped>
.CustomHeadingContainer {
  width: 804.444px;
}

.CustomHeading {
  box-sizing: border-box;
  color: rgb(31, 142, 241);
  direction: ltr;
  display: block;
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 400;
  height: 50px;
  letter-spacing: normal;
  line-height: 50px;
  margin-block-end: 48px;
  margin-block-start: 48px;
  margin-inline-end: 0px;
  margin-inline-start: 0px;
  text-align: left;
  text-size-adjust: 100%;
  unicode-bidi: isolate;
  width: 776px;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.SubHeading {
  box-sizing: border-box;
  color: rgb(31, 142, 241);
  direction: ltr;
  display: block;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  height: 20.9983px;
  line-height: 21px;
  margin-block-end: 16px;
  margin-block-start: 0px;
  margin-bottom: 16px;
  margin-inline-end: 0px;
  margin-inline-start: 0px;
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 0px;
  text-align: left;
  text-size-adjust: 100%;
  unicode-bidi: isolate;
  width: 804.444px;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
