<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <NavBar />
    <router-view />
  </div>
</template>
