<template>
  <div class="fit no-padding no-scroll stick-it">
    <div class="row justify-between stick-it">
      <q-parallax class="stick-it" style="min-height: 1500px">
        <template v-slot:media>
          <q-media-player
            type="video"
            muted
            loop
            :autoplay="true"
            :sources="sources"
            track-language="English"
            :content-height="1200"
            content-class="fixed"
            :bottom-controls="false"
            background-color="black"
          />
        </template>
        <template v-slot:content="scope">
          <div
            class="absolute column items-center scroll"
            :style="{
              opacity: 0.45 + (1 - scope.percentScrolled) * 0.55,
              top: scope.percentScrolled * 30  + '%',
              left: 0,
              right: 0,
              height: scope.percentScrolled*.1 + 100 + '%'
            }"
          >
            <q-img
              src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg"
              style="width: 75px; height: 75px"
              :ratio="1"
            />
            <div class="text-h3 text-white text-center q-my-md text-italic">Aries Man</div>
            <section  class="text-justify text-white text-body1 q-px-md" style="max-width:420px">
              <p class="bg-grey-9 q-pa-sm rounded-borders">
                <q-icon name="format_quote" class="rotate-45 flip-horizontal" />Aries men are fairly bursting with ideas and creative energy.
                Keeping up with him may be tiring, but keep up you’d better. At
                least mentally. Aries has a way of leaving the snails behind and
                not glancing back. He’ll probably look and act younger than
                springtime, which is all very delightful, but his youthful aura
                may carry over into his mental and emotional attitudes until he’s
                matured, which won’t be early in life.<q-icon name="format_quote" /></p>
              </section>
              <section  class="text-justify text-white text-body1 q-px-md" style="max-width:420px">
              <p class="bg-grey-9 q-pa-sm rounded-borders">
                <q-icon name="format_quote" class="rotate-45 flip-horizontal" />The Aries man is impatient
                with slow pokes, bold and confident, always ahead of others, and
                sometimes ahead of himself as well. He can be the soul of
                generosity, giving his time, money, sympathy and possessions by
                the carload cheerfully to strangers. But he can also be
                exasperatingly intolerant, thoughtless, selfish and demanding,
                when his desires are delayed, or he’s forced to be around negative
                people.<q-icon name="format_quote" />
              </p>
            </section>
            <p class="text-white text-h5 bg-grey-10 text-italic">~ Linda Goodman ~</p>
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
          src: 'https://picmymenu.s3.eu-west-3.amazonaws.com/2017_06_21_13_53_15_orig.mp4',
          type: 'video/mp4'
        }
      ],
      rotation: null,
      rotations: [
        'rotate-45',
        'rotate-90',
        'rotate-135',
        'rotate-180',
        'rotate-225',
        'rotate-270',
        'rotate-315'
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
<style lang="scss">
.stick-it{
  position: sticky;
}
</style>
