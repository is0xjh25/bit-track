<template>
    <h3 class="CustomHeading">
      <slot></slot>
    </h3>
  </template>
  
  <script>
  export default {
    name: 'CustomHeading'
  }
  </script>
  
  <style scoped>
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
  </style>
  