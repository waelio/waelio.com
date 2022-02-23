<route lang="yaml">
meta:
  layout: simple
</route>

<template>
  <div>
    <ClientOnly>
      <canvas id="bg" ref="my_bg_canvas" class="my_bg_canvas"></canvas>
      <q-intersection
        transition="fade"
        :duration="1000"
        class="the-menu-list flex flex-column column justify-center content-center mt-10vh"
      >
        <q-btn
          dense
          fab
          glossy
          color="green"
          class="width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/about"
          >About</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          color="yellow"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/contact"
          >Contact</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          color="pink"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/privacy"
          >Privacy</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          color="blue"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/terms"
          >Terms</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          color="purple"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/plugins"
          >Plugins</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          color="orange"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          to="/games"
          >Games</q-btn
        >
        <q-btn
          dense
          fab
          glossy
          :color="isDark ? 'white' : 'dark'"
          class="max-width:1em animate__animated animate__flip q-my-sm q-mx-sm"
          @click.prevent="toggleDark"
          >Toggle Light</q-btn
        >
      </q-intersection>
      <Subscriptions class="to-bottom b2 animate__animated animate__flip" />
      <TimeAgo class="to-bottom b0 text-white" />
    </ClientOnly>
  </div>
</template>
<script lang="ts" setup>
import { onMounted,ref } from "vue";
import "animate.css";
import {
  createLight,
  createMoon,
  spaceTexture,
  camera,
  scene,
  addStar,
  three as THREE,
  width,
  height,
} from "src/utils/canvas-utils";
import { isDark, toggleDark } from "~/logic";
const my_bg_canvas = ref("");
const windowInnerWidth = width;
const windowInnerHeight = height;

onMounted(async () => {
  
  const renderer = new THREE.WebGLRenderer({
    canvas: my_bg_canvas.value,
  });
  console.log("mounted in the Vite api!");
  // Set Renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowInnerWidth, windowInnerHeight);

  // Camera
  camera.position.setZ(30);
  renderer.render(scene, camera);

  // Spotlight
  const pointLight = createLight(100, 100, 100);
  // AmbientLight
  const spColor = `49, 80%, 60%`;
  const ambientLight = createLight(5, 5, 5, spColor);
  scene.add(pointLight, ambientLight);
  // Stars
  Array(200).fill(null).forEach(addStar);

  // Background
  scene.background = spaceTexture;

  // moon
  const moon = createMoon();
  moon.position.z = 1;
  moon.position.setY(15);
  moon.position.setX(width * -0.01);
  scene.add(moon);

  const animate = () => {
    window.requestAnimationFrame(animate);
    moon.rotation.y += 0.0006;
    renderer.render(scene, camera);
  };

  animate();
}); // End of onMounted
</script>
<style lang="scss" scoped>
canvas#bg {
  position: absolute;
  width: 100%;
  height: var(--vh, 100vh);
  top: 0;
  margin-left: 0;
  margin-right: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}
.prose-sm h2 + * {
  margin-top: -25px;
}
#home_page *,
#home_page {
  font-size: initial;
  line-height: initial;
}
#home_page h3 {
  margin: unset !important;
}
.links-list h2 {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}
.links-list * {
  font-size: inherit;
  line-height: inherit;
}
.b0 {
  bottom: 0;
}
.b2 {
  bottom: 2em;
}
.to-bottom {
  position: absolute;
  left: 0;
  right: 0;
}
.special-position {
  position: absolute;
  left: -100%;
  top: 4em;
  color: white;
  right: -100%;
}
.the-menu-list * {
  display: flex;
  flex-direction: column;
  transform: rotate(360deg);
  transition: transform 0.5s;
}
.the-menu-list *:hover {
  transform: rotate(0deg);
}
.the-menu-list *:active {
  transform: rotate(0deg);
  transition: 0s;
}
</style>
