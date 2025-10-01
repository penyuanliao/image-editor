<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Symbols',
    inheritAttrs: false,
    props: {
        name: {
            type: String,
            required: true
        },
        width: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: ''
        }
    }
});
</script>

<template>
    <template v-if="name === 'star'">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path
            fill="currentColor"
            d="m6.173 13.004.17.371a8.7 8.7 0 0 0 3.3 3.638l.265.155a.181.181 0 0 1 0 .316q-.135.075-.265.155a8.7 8.7 0 0 0-3.3 3.639l-.17.371a.19.19 0 0 1-.346 0l-.17-.372a8.7 8.7 0 0 0-3.565-3.793.181.181 0 0 1 0-.316l.265-.155a8.7 8.7 0 0 0 3.3-3.638l.17-.371a.19.19 0 0 1 .346 0M15.078 2.73q.144.327.297.65a15.2 15.2 0 0 0 6.239 6.638.317.317 0 0 1 0 .553q-.235.132-.464.271a15.2 15.2 0 0 0-6.072 7.017.331.331 0 0 1-.605 0 15.2 15.2 0 0 0-6.536-7.289.317.317 0 0 1 0-.552q.234-.132.463-.271a15.2 15.2 0 0 0 6.073-7.017.331.331 0 0 1 .605 0"/>
      </svg>
    </template>
    <template v-else-if="name === 'text'">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            fill="currentColor"
            d="M2 5V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V4h-7v16h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3V4H4v1a1 1 0 0 1-2 0"/>
      </svg>
    </template>
  <template v-else-if="name === 'upload'">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path
          d="m7 19-1.217-.005a5 5 0 0 1-.115-9.984A7.002 7.002 0 0 1 18.93 11H19a4 4 0 0 1 .2 7.995L17 19m-5 1v-8m0 0 3 3m-3-3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </template>
  <template v-else-if="name === 'sticker'">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
          fill="currentColor"
          d="M20 11.5v-4A3.5 3.5 0 0 0 16.5 4h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h5a1.5 1.5 0 0 0 1.5-1.5v-2a3.5 3.5 0 0 1 3.5-3.5h1a1.5 1.5 0 0 0 1.5-1.5m-.073 2.053A2.5 2.5 0 0 1 18.5 14h-1a2.5 2.5 0 0 0-2.5 2.5v2c0 .422-.105.82-.29 1.169a7.51 7.51 0 0 0 5.217-6.116M7.5 3h9A4.5 4.5 0 0 1 21 7.5v5a8.5 8.5 0 0 1-8.5 8.5h-5A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3"/>
    </svg>
  </template>
  <template v-else-if="name === 'image'">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14.526 12.621 6 22h12.133A3.867 3.867 0 0 0 22 18.133V18c0-.466-.175-.645-.49-.99l-4.03-4.395a2 2 0 0 0-2.954.006" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'bold'">
    <svg viewBox="0 0 24 24" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color">
      <path
          fill="currentColor"
          d="M16.42 11.35A5.45 5.45 0 0 0 18 7.5 5.51 5.51 0 0 0 12.5 2H5a1 1 0 0 0 0 2h1v16H5a1 1 0 0 0 0 2h9.5a5.5 5.5 0 0 0 1.92-10.65M12.5 4a3.5 3.5 0 0 1 0 7H8V4Zm2 16H8v-7h6.5a3.5 3.5 0 0 1 0 7"/>
    </svg>
  </template>
  <template v-else-if="name === 'magic'">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
          fill="currentColor"
          d="m10.686 7.565.136.126 10.48 10.487a2.27 2.27 0 0 1-3.21 3.21L7.611 10.9a2.25 2.25 0 0 1 .001-3.182l.157-.147a2.25 2.25 0 0 1 2.916-.006m.848 2.961-1.088 1.088 8.706 8.713a.77.77 0 1 0 1.089-1.088zm-4.386 4.48L7.25 15a.75.75 0 0 1 .743.648L8 15.75v.75h.75a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743L8.75 18H8v.75a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.743-.648L6.5 18.75V18h-.75a.75.75 0 0 1-.743-.648L5 17.25a.75.75 0 0 1 .648-.743l.102-.007h.75v-.75a.75.75 0 0 1 .648-.743L7.25 15zM8.7 8.752l-.027.027a.75.75 0 0 0 0 1.061l.711.713 1.089-1.089-.73-.73a.75.75 0 0 0-1.043.018m8.447-3.745L17.25 5a.75.75 0 0 1 .743.648L18 5.75v.75h.75a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743L18.75 8H18v.75a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.743-.648L16.5 8.75V8h-.75a.75.75 0 0 1-.743-.648L15 7.25a.75.75 0 0 1 .648-.743l.102-.007h.75v-.75a.75.75 0 0 1 .648-.743L17.25 5zm-12-2L5.25 3a.75.75 0 0 1 .743.648L6 3.75v.75h.75a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743L6.75 6H6v.75a.75.75 0 0 1-.648.743L5.25 7.5a.75.75 0 0 1-.743-.648L4.5 6.75V6h-.75a.75.75 0 0 1-.743-.648L3 5.25a.75.75 0 0 1 .648-.743L3.75 4.5h.75v-.75a.75.75 0 0 1 .648-.743L5.25 3z"/>
    </svg>
  </template>
  <template v-else-if="name === 'layers'">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="currentColor" stroke-linejoin="round" stroke-width="2">
        <path d="m4 8 8-4 8 4-8 4z"/>
        <path stroke-linecap="round" d="m4 12 8 4 8-4M4 16l8 4 8-4"/>
      </g>
    </svg>
  </template>
</template>

<style scoped lang="scss">

</style>
