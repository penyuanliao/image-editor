<template>
  <footer class="footer">
    <p class="copyright">Copyright © BBIN GROUP 2026. All Rights Reserved.</p>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
@use "@/styles/theme";

.footer {
  width: 100%;
  background-color: #D9D9D9;
  //padding: 43px 0 39px 0;
  text-align: center;
  position: relative;

  .copyright {
    color: #606060;
    font-size: 18px;
    font-family: theme.$font-family;
    font-weight: 400;
    line-height: 28px;
    margin: 43px 0 39px 0;
  }
}
</style>
