<template>
  <div class="fit no-padding">
    <div class="row justify-between">
      <q-parallax style="height: 100vh;">
        <template v-slot:media>
          <q-media-player
            style="top: 10px;"
            type="video"
            background-color="black"
            muted
            autoplay
            loop
            :sources="sources"
            track-language="English"
            :content-height="800"
            :bottom-controls="false"
            />
        </template>
        <template v-slot:content="scope">
          <div
            class="absolute column items-center"
            :style="{
              opacity: 0.45 + (1 - scope.percentScrolled) * 0.55,
              top: scope.percentScrolled * 35 + '%',
              left: 0,
              right: 0
            }"
          >
            <img
              src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg"
              style="width: 150px; height: 150px"
            />
            <div class="text-h3 text-white text-center">Waelio.com</div>
            <p class="text-justify text-white text-body1 q-px-md" style="max-width:420px">
              That creature over there making a phone call-is it an electrically
              charged dynamo? Is it a flaming torch? is it a bird, an
              explosion-or is it Superman? Well, practically. It’s an Aries
              male, which is pretty close. Let’s hope you know what you’re
              looking for. Should it be excitement, an Aries man will provide it
              by the bushel, with seldom a dull moment to blur the sparkle. But
              if you’re looking for the security and contentment of a soothing
              love, you’re in the wrong telephone booth.
            </p>
          </div>
        </template>
      </q-parallax>
    </div>
  </div>
</template>
<script>
import meta from 'src/utils/meta'
export default {
  name: 'PageIndex',
  data () {
    return {
      src: 'img/IMG_7498.MOV',
      spit: 90,
      sources: [
        {
          src: 'video.mov',
          type: 'video/mp4'
        }
      ],
      metaTags: {
        title: 'Home Page',
        description:
          'My Welcome page. A little about my work experiences and about my look at work ethics.'
      }
    }
  },
  meta
}
</script>
