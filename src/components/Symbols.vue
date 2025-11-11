<script lang="ts">
import {defineComponent} from 'vue';
import {Lock, Unlock} from "@element-plus/icons-vue";

export default defineComponent({
  name: 'Symbols',
  components: {Unlock, Lock},
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M19.1667 4.50402C19.1667 2.4799 17.5201 0.833344 15.496 0.833344H4.50401C3.68195 0.833344 2.92193 1.10492 2.30942 1.56357C2.12088 1.70473 1.9465 1.86348 1.78825 2.03736C1.19527 2.68944 0.833334 3.55545 0.833334 4.50402V15.496C0.833334 16.8241 1.54256 17.99 2.602 18.6343C2.70311 18.6958 2.80714 18.7525 2.91411 18.8038C3.02108 18.8555 3.13098 18.9019 3.24333 18.943C3.63653 19.0871 4.06147 19.1662 4.50401 19.1662H15.496C17.5201 19.1662 19.1667 17.5196 19.1667 15.4955V9.75823C19.1667 9.69376 19.1584 9.63075 19.1447 9.57067C19.1589 9.5101 19.1667 9.44758 19.1667 9.3831V4.50353V4.50402ZM17.5084 15.496C17.5084 16.6058 16.6057 17.5084 15.496 17.5084H4.50401C3.39426 17.5084 2.49161 16.6058 2.49161 15.496V4.50402C2.49161 3.6717 2.99959 2.95564 3.72152 2.64987C3.78159 2.62448 3.84314 2.60152 3.90615 2.58198C3.96916 2.56244 4.03363 2.54584 4.09908 2.53216C4.22999 2.50529 4.36529 2.49113 4.50401 2.49113H15.496C16.6057 2.49113 17.5084 3.39378 17.5084 4.50353V9.3831C17.5084 9.44758 17.5167 9.51059 17.5304 9.57067C17.5162 9.63123 17.5084 9.69376 17.5084 9.75823V15.4955V15.496Z"
          fill="currentColor"/>
      <path
          d="M14.3931 8.25722C14.2084 7.48597 13.8397 6.84903 13.6721 6.61409C13.3703 6.26192 13.2359 6.1276 12.2468 6.1276H11.1737V14.0082C11.1737 15.4164 11.3413 15.517 12.8335 15.6347V16.255H7.26664V15.6347C8.69192 15.5175 8.84285 15.4169 8.84285 14.0082V6.1276H7.82005C6.88125 6.1276 6.61261 6.27853 6.29414 6.68101C6.0592 6.99948 5.82474 7.60319 5.6069 8.27383H4.96996C5.08719 7.04979 5.20491 5.74221 5.23812 4.93726H5.74122C5.99277 5.32313 6.19401 5.35634 6.69711 5.35634H13.404C13.8568 5.35634 14.0912 5.25572 14.3765 4.93726H14.863C14.8796 5.6416 14.947 7.11719 15.0305 8.20691L14.3936 8.25722H14.3931Z"
          fill="currentColor"/>
    </svg>
  </template>
  <template v-else-if="name === 'upload'">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path
          d="m7 19-1.217-.005a5 5 0 0 1-.115-9.984A7.002 7.002 0 0 1 18.93 11H19a4 4 0 0 1 .2 7.995L17 19m-5 1v-8m0 0 3 3m-3-3-3 3"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </template>
  <template v-else-if="name === 'sticker'">
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M14.6627 0.00102123H3.67067C2.84862 0.00102123 2.08859 0.284934 1.47608 0.76442C1.28754 0.911993 1.11317 1.07795 0.954912 1.25974C0.361938 1.94143 0 2.84679 0 3.83844V14.4964C0 15.8848 0.709224 17.1037 1.76866 17.7773C1.86977 17.8416 1.97381 17.9008 2.08078 17.9544C2.18775 18.0086 2.29765 18.0571 2.40999 18.1C2.80319 18.2506 3.22814 18.3333 3.67067 18.3333H9.64827L11.1791 16.5997L16.8152 10.2168L18.3333 8.49749V3.83742C18.3333 1.72135 16.6868 0 14.6627 0V0.00102123ZM12.9243 8.49851C11.1151 8.49851 9.64827 10.0319 9.64827 11.9233V16.6002H3.67067C2.56092 16.6002 1.65827 15.6566 1.65827 14.4964V3.83844C1.65827 2.96832 2.16626 2.21973 2.88818 1.90007C2.94826 1.87352 3.0098 1.84952 3.07281 1.82909C3.13582 1.80867 3.2003 1.79131 3.26575 1.77701C3.39665 1.74892 3.53195 1.73411 3.67067 1.73411H14.6627C15.7724 1.73411 16.6751 2.67777 16.6751 3.83793V8.498L12.9243 8.49851Z"
          fill="currentColor"/>
    </svg>
  </template>
  <template v-else-if="name === 'image'">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round"/>
      <path
          d="M14.526 12.621 6 22h12.133A3.867 3.867 0 0 0 22 18.133V18c0-.466-.175-.645-.49-.99l-4.03-4.395a2 2 0 0 0-2.954.006"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
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
  <template v-else-if="name === 'layers-up'">
    <svg width="24" height="24" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.15.39.339.201a.03.03 0 0 1 .042 0L.57.39M.15.54h.42" stroke="#000" stroke-width=".06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'layers-down'">
    <svg width="24" height="24" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.57.33.381.519a.03.03 0 0 1-.042 0L.15.33M.57.18H.15" stroke="#000" stroke-width=".06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'layers-top'">
    <svg width="24px" height="24px" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.57 0.12H0.15m0.21 0.48V0.24m0 0 -0.09 0.09m0.09 -0.09 0.09 0.09" stroke="#000000" stroke-width="0.06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'layers-bottom'">
    <svg width="24" height="24" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.15.6h.42M.36.12v.36m0 0L.45.39M.36.48.27.39" stroke="#000" stroke-width=".06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'align-left'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M1.32 1.2v5.28a.12.12 0 0 1-.24 0V1.2a.12.12 0 0 1 .24 0m.72 1.92v-1.2a.36.36 0 0 1 .36-.36h2.88a.36.36 0 0 1 .36.36v1.2a.36.36 0 0 1-.36.36H2.4a.36.36 0 0 1-.36-.36m.24 0a.12.12 0 0 0 .12.12h2.88a.12.12 0 0 0 .12-.12v-1.2a.12.12 0 0 0-.12-.12H2.4a.12.12 0 0 0-.12.12Zm4.56 1.44v1.2a.36.36 0 0 1-.36.36H2.4a.36.36 0 0 1-.36-.36v-1.2a.36.36 0 0 1 .36-.36h4.08a.36.36 0 0 1 .36.36m-.24 0a.12.12 0 0 0-.12-.12H2.4a.12.12 0 0 0-.12.12v1.2a.12.12 0 0 0 .12.12h4.08a.12.12 0 0 0 .12-.12Z"/>
    </svg>
  </template>
  <template v-else-if="name === 'align-right'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M6.6 1.2v5.28a.12.12 0 0 1-.24 0V1.2a.12.12 0 0 1 .24 0m-.96.72v1.2a.36.36 0 0 1-.36.36H2.4a.36.36 0 0 1-.36-.36v-1.2a.36.36 0 0 1 .36-.36h2.88a.36.36 0 0 1 .36.36m-.24 0a.12.12 0 0 0-.12-.12H2.4a.12.12 0 0 0-.12.12v1.2a.12.12 0 0 0 .12.12h2.88a.12.12 0 0 0 .12-.12Zm.24 2.64v1.2a.36.36 0 0 1-.36.36H1.2a.36.36 0 0 1-.36-.36v-1.2a.36.36 0 0 1 .36-.36h4.08a.36.36 0 0 1 .36.36m-.24 0a.12.12 0 0 0-.12-.12H1.2a.12.12 0 0 0-.12.12v1.2a.12.12 0 0 0 .12.12h4.08a.12.12 0 0 0 .12-.12Z"/>
    </svg>
  </template>
  <template v-else-if="name === 'align-center'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M6.72 3.72h-.6V2.16a.36.36 0 0 0-.36-.36h-1.2a.36.36 0 0 0-.36.36v1.56h-.72V1.44a.36.36 0 0 0-.36-.36h-1.2a.36.36 0 0 0-.36.36v2.28h-.6a.12.12 0 0 0 0 .24h.6v2.28a.36.36 0 0 0 .36.36h1.2a.36.36 0 0 0 .36-.36V3.96h.72v1.56a.36.36 0 0 0 .36.36h1.2a.36.36 0 0 0 .36-.36V3.96h.6a.12.12 0 0 0 0-.24M3.24 6.24a.12.12 0 0 1-.12.12h-1.2a.12.12 0 0 1-.12-.12v-4.8a.12.12 0 0 1 .12-.12h1.2a.12.12 0 0 1 .12.12Zm2.64-.72a.12.12 0 0 1-.12.12h-1.2a.12.12 0 0 1-.12-.12V2.16a.12.12 0 0 1 .12-.12h1.2a.12.12 0 0 1 .12.12Z"/>
    </svg>
  </template>
  <template v-else-if="name === 'align-middle'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M6.24 4.2H3.96v-.72h1.56a.36.36 0 0 0 .36-.36v-1.2a.36.36 0 0 0-.36-.36H3.96v-.6a.12.12 0 1 0-.24 0v.6H2.16a.36.36 0 0 0-.36.36v1.2a.36.36 0 0 0 .36.36h1.56v.72H1.44a.36.36 0 0 0-.36.36v1.2a.36.36 0 0 0 .36.36h2.28v.6a.12.12 0 0 0 .24 0v-.6h2.28a.36.36 0 0 0 .36-.36v-1.2a.36.36 0 0 0-.36-.36m-4.2-1.08v-1.2a.12.12 0 0 1 .12-.12h3.36a.12.12 0 0 1 .12.12v1.2a.12.12 0 0 1-.12.12H2.16a.12.12 0 0 1-.12-.12m4.32 2.64a.12.12 0 0 1-.12.12h-4.8a.12.12 0 0 1-.12-.12v-1.2a.12.12 0 0 1 .12-.12h4.8a.12.12 0 0 1 .12.12Z"/>
    </svg>
  </template>
  <template v-else-if="name === 'align-top'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M6.6 1.2a.12.12 0 0 1-.12.12H1.2a.12.12 0 0 1 0-.24h5.28a.12.12 0 0 1 .12.12m-.48 1.2v2.88a.36.36 0 0 1-.36.36h-1.2a.36.36 0 0 1-.36-.36V2.4a.36.36 0 0 1 .36-.36h1.2a.36.36 0 0 1 .36.36m-.24 0a.12.12 0 0 0-.12-.12h-1.2a.12.12 0 0 0-.12.12v2.88a.12.12 0 0 0 .12.12h1.2a.12.12 0 0 0 .12-.12Zm-2.4 0v4.08a.36.36 0 0 1-.36.36h-1.2a.36.36 0 0 1-.36-.36V2.4a.36.36 0 0 1 .36-.36h1.2a.36.36 0 0 1 .36.36m-.24 0a.12.12 0 0 0-.12-.12h-1.2a.12.12 0 0 0-.12.12v4.08a.12.12 0 0 0 .12.12h1.2a.12.12 0 0 0 .12-.12Z"/>
    </svg>
  </template>
  <template v-else-if="name === 'align-bottom'">
    <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg">
      <path
          d="M6.6 6.48a.12.12 0 0 1-.12.12H1.2a.12.12 0 1 1 0-.24h5.28a.12.12 0 0 1 .12.12m-2.4-1.2V2.4a.36.36 0 0 1 .36-.36h1.2a.36.36 0 0 1 .36.36v2.88a.36.36 0 0 1-.36.36h-1.2a.36.36 0 0 1-.36-.36m.24 0a.12.12 0 0 0 .12.12h1.2a.12.12 0 0 0 .12-.12V2.4a.12.12 0 0 0-.12-.12h-1.2a.12.12 0 0 0-.12.12Zm-2.88 0V1.2a.36.36 0 0 1 .36-.36h1.2a.36.36 0 0 1 .36.36v4.08a.36.36 0 0 1-.36.36h-1.2a.36.36 0 0 1-.36-.36m.24 0a.12.12 0 0 0 .12.12h1.2a.12.12 0 0 0 .12-.12V1.2a.12.12 0 0 0-.12-.12h-1.2a.12.12 0 0 0-.12.12Z"/>
    </svg>
  </template>
  <template
      v-if="name === 'close'"
  >
    <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
      <path
          d="M13.6516 9.65165C13.9445 9.35876 13.9445 8.88388 13.6516 8.59099C13.3588 8.2981 12.8839 8.2981 12.591 8.59099L11 10.182L9.40901 8.59099C9.11612 8.2981 8.64124 8.2981 8.34835 8.59099C8.05546 8.88388 8.05546 9.35876 8.34835 9.65165L9.93934 11.2426L8.34835 12.8336C8.05546 13.1265 8.05546 13.6014 8.34835 13.8943C8.64124 14.1872 9.11612 14.1872 9.40901 13.8943L11 12.3033L12.591 13.8943C12.8839 14.1872 13.3588 14.1872 13.6517 13.8943C13.9445 13.6014 13.9445 13.1265 13.6517 12.8336L12.0607 11.2426L13.6516 9.65165Z"
          fill="currentColor"
      />
      <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11 0.25C5.06294 0.25 0.25 5.06294 0.25 11C0.25 16.9371 5.06294 21.75 11 21.75C16.9371 21.75 21.75 16.9371 21.75 11C21.75 5.06294 16.9371 0.25 11 0.25ZM1.75 11C1.75 5.89137 5.89137 1.75 11 1.75C16.1086 1.75 20.25 5.89137 20.25 11C20.25 16.1086 16.1086 20.25 11 20.25C5.89137 20.25 1.75 16.1086 1.75 11Z"
          fill="currentColor"
      />
    </svg>
  </template>
  <template
      v-if="name === 'search'"
  >
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="width ? width : '23'"
        :height="height ? height : '23'"
        viewBox="0 0 23 23"
        fill="none"
    >
      <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10 0.25C4.61522 0.25 0.25 4.61522 0.25 10C0.25 15.3848 4.61522 19.75 10 19.75C15.3848 19.75 19.75 15.3848 19.75 10C19.75 4.61522 15.3848 0.25 10 0.25ZM1.75 10C1.75 5.44365 5.44365 1.75 10 1.75C14.5563 1.75 18.25 5.44365 18.25 10C18.25 14.5563 14.5563 18.25 10 18.25C5.44365 18.25 1.75 14.5563 1.75 10Z"
          fill="currentColor"
      />
      <path
          d="M18.5304 17.4698C18.2375 17.1769 17.7626 17.1769 17.4697 17.4698C17.1768 17.7626 17.1768 18.2375 17.4697 18.5304L21.4696 22.5304C21.7625 22.8233 22.2374 22.8233 22.5303 22.5304C22.8232 22.2375 22.8232 21.7626 22.5303 21.4697L18.5304 17.4698Z"
          fill="currentColor"
      />
    </svg>
  </template>
  <template v-else-if="name === 'customize'">
    <svg width="52" height="54" viewBox="0 0 52 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_5090_135)">
        <g filter="url(#filter0_d_5090_135)">
          <path
              d="M41.8748 13.4826H49.3781C50.5098 13.4826 51.4287 12.5624 51.4287 11.4259C51.4287 10.2894 50.5112 9.37064 49.3781 9.37064H41.8748C40.7432 9.37064 39.8257 10.2909 39.8257 11.4259C39.8257 12.561 40.7432 13.4826 41.8748 13.4826Z"
              fill="white"/>
        </g>
        <g filter="url(#filter1_d_5090_135)">
          <path
              d="M2.05203 13.4826H11.7882C13.477 13.8005 15.092 14.6133 16.3988 15.924C17.7388 17.2681 18.5579 18.9358 18.856 20.6746C19.0383 21.7371 19.9471 22.5267 21.0223 22.5282C21.0368 22.5282 21.0498 22.5282 21.0643 22.5282C22.1395 22.5267 23.0483 21.7357 23.2306 20.6746C23.5302 18.9343 24.3492 17.2666 25.6878 15.924C27.0278 14.5799 28.6906 13.7584 30.4257 13.458C31.485 13.2751 32.2722 12.3636 32.2736 11.2851V11.243C32.2722 10.1646 31.4835 9.25308 30.4257 9.07019C28.6906 8.76974 27.0278 7.94821 25.6878 6.60561C24.3478 5.26155 23.5287 3.59382 23.2291 1.85352C23.0468 0.791047 22.138 0.00145146 21.0628 0C21.0483 0 21.0353 0 21.0208 0C19.9471 0.00290293 19.0383 0.791047 18.856 1.85352C18.5564 3.59382 17.7373 5.26155 16.3973 6.60561C15.0573 7.94966 13.3945 8.77119 11.6594 9.07019C11.3729 9.11954 11.1066 9.22405 10.8693 9.36919H2.05203C0.920385 9.36919 0.00146484 10.2894 0.00146484 11.4245C0.00146484 12.5595 0.918937 13.4812 2.05203 13.4812V13.4826Z"
              fill="white"/>
        </g>
        <g filter="url(#filter2_d_5090_135)">
          <path
              d="M2.05154 30.2833H17.2246C18.3562 30.2833 19.2737 29.3631 19.2737 28.2266C19.2737 27.0901 18.3562 26.1713 17.2246 26.1713H2.05154C0.919896 26.1713 0.000976562 27.0916 0.000976562 28.2266C0.000976562 29.3616 0.918449 30.2833 2.05154 30.2833Z"
              fill="white"/>
        </g>
        <g filter="url(#filter3_d_5090_135)">
          <path
              d="M49.3784 42.972H40.428C39.2964 42.972 38.3789 43.8922 38.3789 45.0287C38.3789 46.1652 39.2964 47.084 40.428 47.084H49.3784C50.5101 47.084 51.429 46.1638 51.429 45.0287C51.429 43.8937 50.5115 42.972 49.3784 42.972Z"
              fill="white"/>
        </g>
        <g filter="url(#filter4_d_5090_135)">
          <path
              d="M47.0454 29.4139C48.3276 29.1918 49.2798 28.0887 49.2827 26.7838C49.2827 26.7664 49.2827 26.7505 49.2827 26.733C49.2798 25.4282 48.3276 24.3251 47.0454 24.103C44.9457 23.7401 42.9327 22.7459 41.3105 21.1188C39.6883 19.4917 38.697 17.4727 38.3352 15.3666C38.1138 14.0806 37.014 13.1241 35.7131 13.1227C35.6957 13.1227 35.6783 13.1227 35.6624 13.1227C34.3615 13.1256 33.2616 14.0806 33.0417 15.3666C32.6799 17.4742 31.6886 19.4932 30.0664 21.1202C28.4456 22.7459 26.4327 23.7416 24.3315 24.1045C23.0493 24.3265 22.0971 25.4296 22.0942 26.7345C22.0942 26.7519 22.0942 26.7679 22.0942 26.7853C22.0971 28.0902 23.0493 29.1933 24.3315 29.4154C26.4327 29.7782 28.4456 30.7739 30.0664 32.3996C31.6872 34.0252 32.6799 36.0442 33.0417 38.1503C33.2631 39.4363 34.3629 40.3928 35.6639 40.3942C35.6812 40.3942 35.6971 40.3942 35.7145 40.3942C37.0155 40.3913 38.1153 39.4363 38.3367 38.1503C38.6985 36.0442 39.6897 34.0252 41.312 32.3996C42.9342 30.7725 44.9471 29.7782 47.0469 29.4154L47.0454 29.4139Z"
              fill="white"/>
        </g>
        <g filter="url(#filter5_d_5090_135)">
          <path
              d="M32.4757 43.4379C31.1516 43.2086 29.8811 42.5816 28.858 41.5554C27.8348 40.5292 27.2097 39.2562 26.981 37.9267C26.8421 37.1153 26.1475 36.513 25.327 36.5115C25.3169 36.5115 25.3053 36.5115 25.2951 36.5115C24.4746 36.513 23.7815 37.1168 23.6411 37.9267C23.4124 39.2562 22.7873 40.5292 21.7642 41.5554C21.1506 42.1708 20.4459 42.6425 19.6948 42.972H2.05154C0.919896 42.972 0.000976562 43.8922 0.000976562 45.0287C0.000976562 46.1652 0.918449 47.084 2.05154 47.084H19.2679C20.1796 47.4106 21.0363 47.9389 21.7656 48.6704C22.7887 49.6966 23.4139 50.9696 23.6425 52.2991C23.7815 53.1105 24.4761 53.7128 25.2966 53.7143H25.3284C26.1489 53.7128 26.8436 53.109 26.9825 52.2991C27.2111 50.971 27.8363 49.6966 28.8594 48.6704C29.8825 47.6443 31.1516 47.0172 32.4772 46.7879C33.2861 46.6486 33.8867 45.9518 33.8881 45.1289C33.8881 45.1187 33.8881 45.1071 33.8881 45.0969C33.8867 44.274 33.2847 43.5773 32.4772 43.4379H32.4757Z"
              fill="white"/>
        </g>
      </g>
      <defs>
        <filter id="filter0_d_5090_135" x="35.8257" y="8.37064" width="19.603" height="12.112"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <filter id="filter1_d_5090_135" x="-3.99854" y="-1" width="40.272" height="30.5282" filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <filter id="filter2_d_5090_135" x="-3.99902" y="25.1713" width="27.2729" height="12.112"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <filter id="filter3_d_5090_135" x="34.3789" y="41.972" width="21.0503" height="12.112"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <filter id="filter4_d_5090_135" x="18.0942" y="12.1227" width="35.1885" height="35.2715"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <filter id="filter5_d_5090_135" x="-3.99902" y="35.5115" width="41.8872" height="25.2027"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.246073 0 0 0 0 0.247496 0 0 0 0 0.251768 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5090_135"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5090_135" result="shape"/>
        </filter>
        <clipPath id="clip0_5090_135">
          <rect width="51.4286" height="53.7143" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  </template>
  <template v-else-if="name === 'flip-horizontal'">
    <svg width="20" height="20" viewBox="0 0 0.72 0.72" xmlns="http://www.w3.org/2000/svg"><path d="M.39.39v.06H.36V.39zm0-.3V.03H.36v.06zm0 .48V.51H.36v.06zM.36.27v.06h.03V.27zm0-.12v.06h.03V.15zm0 .48v.06h.03V.63zM.69.57V.18L.42.375zM.33.375.06.57V.18zM.09.511.279.375.09.239z"/><path fill="none" d="M0 0h.72v.72H0z"/></svg>
  </template>
  <template v-else-if="name === 'flip-vertical'">
    <svg width="20" height="20" viewBox="0 0 0.72 0.72" xmlns="http://www.w3.org/2000/svg" transform="rotate(-90)"><path d="M.39.39v.06H.36V.39zm0-.3V.03H.36v.06zm0 .48V.51H.36v.06zM.36.27v.06h.03V.27zm0-.12v.06h.03V.15zm0 .48v.06h.03V.63zM.69.57V.18L.42.375zM.33.375.06.57V.18zM.09.511.279.375.09.239z"/><path fill="none" d="M0 0h.72v.72H0z"/></svg>
  </template>
  <template v-else-if="name === 'picture'">
    <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M69 13.815C69 6.197 62.803 0 55.185 0h-41.37a13.74 13.74 0 0 0-8.26 2.748 14 14 0 0 0-1.961 1.784A13.76 13.76 0 0 0 0 13.815v41.371c0 3.412 1.245 6.54 3.302 8.952v.674l.61-.004a13.9 13.9 0 0 0 3.92 2.828q.604.293 1.238.524c1.48.542 3.08.84 4.745.84h41.37C62.803 69 69 62.803 69 55.185V33.59c0-.243-.031-.48-.083-.706q.082-.342.083-.706zM10.87 6.837a7.5 7.5 0 0 1 1.421-.443 7.6 7.6 0 0 1 1.524-.155h4.006a.7.7 0 0 0-.048.144c-1.831 8.35-4.033 11.015-11.532 12.935v-5.503a7.59 7.59 0 0 1 4.63-6.978M62.76 33.593v3.695L53.02 26.19c-3.046-3.471-8.478-3.383-11.408.185L27.97 42.98l-4.387-4.753c-3.017-3.268-8.203-3.2-11.133.15l-6.212 7.1v-23.91c7.499 1.918 9.701 4.586 11.532 12.936.162.74 1.217.74 1.379 0 1.972-8.997 4.373-11.396 13.368-13.369.741-.162.741-1.217 0-1.379-8.997-1.972-11.396-4.373-13.368-13.368a.7.7 0 0 0-.048-.144h36.081c4.177 0 7.574 3.397 7.574 7.574v18.366c0 .242.031.48.083.706a3 3 0 0 0-.083.706z" fill="#F15624"/></svg>
  </template>
  <template v-else-if="name === 'delete'">
    <svg width="24" height="24" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M.3.36v.15M.42.36v.15m-.3-.3H.6M.18.3v.24a.09.09 0 0 0 .09.09h.18A.09.09 0 0 0 .54.54V.3M.27.15A.06.06 0 0 1 .33.09h.06a.06.06 0 0 1 .06.06v.06H.27z" stroke="currentColor" stroke-width=".06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'copy'">
    <svg width="24" height="24" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.15.45C.122.45.108.45.097.445A.06.06 0 0 1 .065.413C.06.402.06.388.06.36V.156c0-.034 0-.05.007-.063A.06.06 0 0 1 .093.067C.106.06.122.06.156.06H.36c.028 0 .042 0 .053.005a.06.06 0 0 1 .032.032C.45.108.45.122.45.15M.366.66h.198c.034 0 .05 0 .063-.007A.06.06 0 0 0 .653.627C.66.614.66.598.66.564V.366c0-.034 0-.05-.007-.063A.06.06 0 0 0 .627.277C.614.27.598.27.564.27H.366c-.034 0-.05 0-.063.007a.06.06 0 0 0-.026.026C.27.316.27.332.27.366v.198c0 .034 0 .05.007.063a.06.06 0 0 0 .026.026C.316.66.332.66.366.66" stroke="#000" stroke-width=".06" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </template>
  <template v-else-if="name === 'lock'">
    <Lock/>
  </template>
  <template v-else-if="name === 'unlock'">
    <Unlock/>
  </template>
</template>

<style scoped lang="scss">

</style>
