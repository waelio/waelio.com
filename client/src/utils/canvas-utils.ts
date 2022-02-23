import * as THREE from "three";
import { ref } from "vue";
THREE.Cache.enabled = true;
export const three = THREE
export const width: number = window.innerWidth;
export const height: number = window.innerHeight;
export const scene = new THREE.Scene();
const fieldOfView = 75; // field of view - straight view is 60 degrees
// const windowInnerWidth = width;
// const windowInnerHeight = height;
const aspectRatio = width / height;
const viewFrustum = 0.1;
const viewDistance = 1000;
export const my_bg_canvas = ref("");



export const spaceTexture = new THREE.TextureLoader().load("/space.jpg");
export const camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  viewFrustum,
  viewDistance
);
export const createSphere = (x: number, y: number, z: number, color: number) => {
  // Sphere - bubble
  const geometry = new THREE.SphereGeometry(x, y, z);
  const material = new THREE.MeshStandardMaterial({ color: color, wireframe: false });
  const sphere = new THREE.Mesh(geometry, material);
  return sphere;
};

// Moon
export const createMoon = (): any => {
  const moonTexture = new THREE.TextureLoader().load("/moon.jpg");
  const normalTexture = new THREE.TextureLoader().load("/normal.jpg");
  const geometry = new THREE.SphereGeometry(2, 90, 90);
  const material = new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  });
  const moon = new THREE.Mesh(geometry, material);
  return moon;
};

export const createStar = (geometry: any, material: any) => {
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3)
    .fill(0)
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  return star;
};

export const createStars = () => {
  const geometry = new THREE.Geometry();
  const material = new THREE.PointsMaterial({ color: 0xffffff });
  for (let i = 0; i < 10000; i++) {
    const star = createStar(geometry, material);
    scene.add(star);
  }
  return geometry;
}

export const createLight = (x: number, y: number, z: number, color: string = `0xffffff`) => {
  const light = new THREE.PointLight(color, 1, 0);
  light.position.set(x, y, z);
  scene.add(light);
  return light;
};
export const addStar = () => {
  const geometry = new three.SphereGeometry(0.25, 23, 24);
  const material = new three.MeshStandardMaterial({ color: 0xffffff });
  const star = createStar(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => three.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
};
export const getCanvas = () => {
  return my_bg_canvas && my_bg_canvas.value
    ? my_bg_canvas.value
    : window && document.getElementById("bg") ?
      document.getElementById("bg")
      : document.createElement("canvas");
}
// const cleanCanvas = my_bg_canvas.value
// export const renderer = new THREE.WebGLRenderer({
//   canvas: getCanvas(),
// });
