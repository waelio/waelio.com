<template>
  <q-page padding>
    <q-card class="q-mx-auto" style="max-width: 420px;">
      <q-card-section class="q-py-lg">
        <div class="text-h4 text-center">{{$t('We are here')}}</div>
        <div class="text-h6 text-center">
          {{$t('Please let us know how we can help!')}}
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
            :rules="[val => (val && val.length > 0) || $t('What is your name?')]"
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
                (val !== null && val !== '') || $t('Please type your email address')
            ]"
          />
          <q-select
            class="q-px-0"
            name="project_name"
            filled
            :label="$t('Select a project')"
            v-model="project_name"
            :hint="$t('What project are you referencing?')"
            :options-value="item => item.value"
            :option-label="item => item.name"
            :options="[
              { value: 'favs-shuffler', name: 'FavsShuffler' },
              { value: 'ar-ps', name: 'Sudoku17' },
              { value: 'he-il', name: 'PicMymenu' },
              { value: 'he-il', name: 'Quran in Pixels' }
            ]"
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
            :rules="[val => (val && val.length > 0) || $t('What is your name?')]"
          />

          <q-toggle
            name="accept"
            v-model="accept"
            :label="$t('I accept the terms and conditions')"
          />
          <p>
            <router-link to="terms" class="full-width">
              {{$t('View our terms and conditions.')}}</router-link
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
  </q-page>
</template>
<script>
import emailjs from 'emailjs-com'
import meta from 'src/utils/meta'
export default {
  name: 'ContactUs',
  beforeCreate () {
    emailjs.init('user_5tP22pGVFDXWM7b3Y6cGZ')
  },
  data () {
    return {
      project_name: '',
      accept: false,
      user_email: '',
      user_name: '',
      message: '',
      metaTags: {
        title: 'Contact Us Page',
        description: 'Want to share a concern? an idea or a bug in any of our projects? Please let us know. Wel will attend to your inqueries as soon as possible'
      }
    }
  },
  meta,
  methods: {
    onSubmit () {
      // const thisForm = document.getElementById('contactForm')
      // console.log(thisForm)
      // const formData = new FormData(thisForm)
      // formData.append('service_id', 'service_o1hhxks')
      // formData.append('template_id', 'template_040828n')
      // formData.append('user_id', 'user_5tP22pGVFDXWM7b3Y6cGZ')
      // formData.append('user_name', this.user_name)
      // formData.append('user_email', this.user_email)
      // formData.append('message', this.fullEmail)
      // formData.append('reply_to', this.user_email)
      // console.log(formData.values)

      emailjs.send(
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
