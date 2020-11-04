<template>
  <main padding class="q-page doc-page q-mx-auto" style="max-width: 420px;">
    <div class="support-page text-center">
      <h2 class="text-h3">Support Page</h2>
      <p class="text-medium">
        The App is pretty simple and straight forward. The purpose of this app is to
        shuffler 3 genres of music:
      </p>
      <div class="bg-grey-8 q-pa-xl">
        <q-list bordered separator>
          <q-item clickable v-ripple class="no-padding q-mb-md">
            <q-item-section class="full-width bg-red">
              <q-item-label class="text-white text-center q-pa-lg q-mb-n1"
                >Russian</q-item-label
              >
              <hr class="width-half text-white" />
              <q-item-label
                caption
                class="text-xl text-white text-center q-pa-sm q-mt-0 q-mb-sm"
                >Plays "Russian" Genre" music.</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple class="no-padding q-mb-md">
            <q-item-section class="full-width bg-white">
              <q-item-label class="text-black-2 q-pa-lg q-mb-n1"
                >Pop</q-item-label
              >
              <hr class="width-half text-black-2" />
              <q-item-label
                caption
                class="text-xl text-black-2 text-center q-pa-sm q-mt-0 q-mb-sm"
                >Play music that is "Pop" Genre</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple class="no-padding q-mb-md">
            <q-item-section class="full-width bg-primary">
              <q-item-label class="text-white q-pa-lg q-mb-n1"
                >Arabic</q-item-label
              >
              <hr class="width-half text-white" />
              <q-item-label
                caption
                class="text-white text-center q-pa-sm q-mt-0 q-mb-sm"
                >Play music that is "Arabic" Genre</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
        <q-list class="row">
          <q-item clickable v-ripple class="q-pa-lg col-6">
            <q-item-section class="full-width bg-red">
              <q-item-label class="text-white q-pa-sm q-mb-n1 text-bold"
                >STOP</q-item-label
              >
              <hr class="width-half text-white" />
              <q-item-label
                caption
                class="text-white text-center q-pa-sm q-mt-0 q-mb-sm text-bold"
                >Stops Music</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple class="q-pa-lg col-6">
            <q-item-section class="full-width bg-white">
              <q-item-label class="text-red q-pa-sm q-mb-n1 text-bold"
                >NEXT</q-item-label
              >
              <hr class="width-half text-red" />
              <q-item-label
                caption
                class="text-red text-center q-pa-sm q-mt-0 q-mb-sm text-bold"
                >Skips Song</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
        <p class="text-white text-justify">
          *** If for any reason the music does not play please make sure that
          you allow access to music library in you privacy seettings.
        </p>
        <p class="text-white text-justify">
          *** Your library must contain songs in the specified geres mentioned
          above, we do not provide the library, we only access your library with
          your permissions in order to filter and play your music.
        </p>
      </div>
      <q-card class="q-mx-auto q-my-md" style="max-width: 420px;">
        <q-card-section class="q-py-lg">
          <div class="text-h4 text-center">{{ $t("Need Help?") }}</div>
          <div class="text-h6 text-center">
            {{ $t("Please let us know how we can help!") }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" ref="contactForm" id="contactForm">
            <q-input
              name="fullname"
              filled
              v-model="user_name"
              :label="$t('Your name *')"
              :hint="$t('Name and surname')"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || $t('What is your name?')
              ]"
            />
            <q-input
              filled
              name="email"
              type="email"
              v-model="user_email"
              :label="$t('Your email address')"
              :hint="$t('In order to get back to you.')"
              lazy-rules
              :rules="[
                val =>
                  (val !== null && val !== '') ||
                  $t('Please type your email address')
              ]"
            />
            <q-input
              filled
              name="project_name"
              type="text"
              :label="$t('FavsShuffler App')"
              v-model="project_name"
              :option-label="item => item.name"
              :value="{ value: 'favs-shuffler', name: 'FavsShuffler' }"
              readonly
            />
            <q-input
              filled
              type="textarea"
              name="message"
              min-height="5rem"
              max-height="10rem"
              v-model="message"
              :label="$t('Your message *')"
              :hint="$t('Tell us how we can help')"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || $t('What is your name?')
              ]"
            />

            <q-toggle
              name="accept"
              v-model="accept"
              :label="$t('I accept the terms and conditions')"
            />
            <p>
              <router-link to="terms" class="full-width">
                {{ $t("View our terms and conditions.") }}</router-link
              >
            </p>

            <q-btn
              name="send"
              :label="$t('Submit')"
              :disabled="!isReadyForm"
              color="primary"
              @click.prevent="onSubmit()"
            />
            <q-btn
              :label="$t('Reset')"
              type="reset"
              color="primary"
              flat
              class="q-ml-sm"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </main>
</template>

<script>
import emailjs from 'emailjs-com'
import meta from 'src/utils/meta'
export default {
  name: 'Support',
  data () {
    return {
      project_name: '',
      accept: false,
      user_email: '',
      user_name: '',
      message: '',
      metaTags: {
        title: 'FavsShuffler App',
        description: 'Support Page for FavsShuffler App.'
      }
    }
  },
  meta,
  methods: {
    onSubmit () {
      emailjs
        .send(
          'service_o1hhxks',
          'template_040828n',
          this.emailBody,
          'user_5tP22pGVFDXWM7b3Y6cGZ'
        )
        .then(result => {
          this.$notification.success('Message Was set successfully.')
          this.$refs.contactForm.reset()
          this.onReset()
        })
        .catch(exception => {
          this.$notification.error(exception)
        })
      return true
    },
    onReset () {
      this.form_valid = false
      this.personalname = ''
      this.project_name = ''
      this.accept = false
      this.user_email = ''
      this.user_name = ''
      this.to_name = ''
      this.message = ''
      this.reply_to = ''
      return true
    }
  },
  computed: {
    isReadyForm () {
      return !!(
        this.user_name &&
        this.user_email &&
        this.project_name &&
        this.accept &&
        this.message
      )
    },
    isEmptyForm () {
      return (
        !this.user_name &&
        !this.user_email &&
        !this.project_name &&
        !this.accept &&
        !this.message
      )
    },
    emailBody () {
      return {
        user_email: this.user_email,
        user_name: this.user_name,
        project_name: this.project_name.name,
        message: this.message,
        reply_to: this.user_email
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.minh-5rem {
  min-height: 5rem;
}
.width-half {
  width: 50%;
}
.width-40percent {
  width: 40%;
}
</style>
