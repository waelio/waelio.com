<template>
  <div class="q-pa-0" :style="{'margin-top':'-34px'}">
    <q-timeline layout="loose" class="q-pa-xs">
      <q-timeline-entry heading>Programming timeline</q-timeline-entry>
      <q-timeline-entry
        v-for="item in history"
        :key="item.i"
        :color="item.color"
        :title="item.name"
        :subtitle="item.year"
        :side="item.i % 2 ? 'right' : 'left'"
      >
        <template v-slot:title>
          <q-btn flat>
            <p
              class="text-weight-this w-100"
              style="font-family: Roboto; font-size: 1.7em;"
              :class="`text-${item.color}`"
            >
              {{ item.name }}
            </p>
            <q-tooltip
              anchor="bottom middle"
              self="center middle"
              :content-class="`bg-${item.color}-light-2`"
              :delay="1000"
              :hide-delay="2000"
            >
              <iframe
                ref="timeline_iframe"
                class="rounded no-border q-pa-0"
                :style="{ width: '75vh', height: '50vw' }"
                :src="item.link"
                frameborder="0"
              ></iframe>
            </q-tooltip>
          </q-btn>
        </template>
        <template v-slot:subtitle>
          <p class="text-h4 font-weight-bold" :class="`text-${item.color}`">
            {{ item.year }}
          </p>
        </template>
        <p class="text-h6 text-weight-bold font-italic w-100 text-start wrap">
          {{ item.text }}
        </p>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>
<script>
import meta from 'src/utils/meta'
export default {
  name: 'TimeLine',
  data () {
    return {
      history: [
        {
          i: 0,
          color: 'red',
          name: 'Logo',
          link: 'https://en.wikipedia.org/wiki/Logo_(programming_language)',
          year: '1984',
          text: 'Summer class in Cairo-Egypt'
        },
        {
          i: 1,
          color: 'orange',
          name: 'Basic',
          link: 'https://en.wikipedia.org/wiki/BASIC"',
          year: '1988',
          text: "Beginner's All-purpose Symbolic Instruction Code"
        },
        {
          i: 2,
          color: 'yellow',
          name: 'Visual Basic',
          link: 'https://en.wikipedia.org/wiki/Visual_Basic',
          year: '1998',
          text: 'I aced it with A+ - LCC'
        },
        {
          i: 3,
          color: 'green',
          name: 'Java',
          link: 'https://en.wikipedia.org/wiki/Java_(programming_language)',
          year: '1999',
          text: 'Data Strucure and Algorithms - LCC'
        },
        {
          i: 4,
          color: 'blue',
          name: 'C++',
          link: 'https://en.wikipedia.org/wiki/C%2B%2B',
          year: '2000',
          text: 'Tough cookie, I made it alive -  UofO'
        },
        {
          i: 5,
          color: 'purple',
          name: 'MySQL',
          link: 'https://en.wikipedia.org/wiki/MySQL',
          year: '2000',
          text: 'Tutoring for stdents - LCC'
        },
        {
          i: 6,
          color: 'brown',
          name: 'Microsoft Access',
          link: 'https://en.wikipedia.org/wiki/Microsoft_Access',
          year: '2001',
          text: 'Tutoring for students - UofO'
        },
        {
          i: 7,
          color: 'orange',
          name: 'Visual Basic',
          link: 'https://en.wikipedia.org/wiki/Visual_Basic',
          year: '2003',
          text: 'NBA Project @ ERC'
        },
        {
          i: 8,
          color: 'teal',
          name: 'ASP',
          link: 'https://en.wikipedia.org/wiki/Active_Server_Pages',
          year: '2005-2012',
          text: 'CRM backend @ SS&K '
        },
        {
          i: 9,
          color: 'cyan',
          name: 'HTML',
          link: 'https://en.wikipedia.org/wiki/HTML',
          year: '2005-2012',
          text: 'CRM UI @ SS&K'
        },
        {
          i: 10,
          color: 'lime',
          name: 'MsSQL',
          link: 'https://en.wikipedia.org/wiki/Microsoft_SQL_Server',
          year: '2005-2012',
          text: 'CRM Storage @ SS&K'
        },
        {
          i: 11,
          color: 'amber',
          name: 'PHP',
          link: 'https://en.wikipedia.org/wiki/PHP"',
          year: '2012',
          text: 'PHP Developer @ Tracy PMI'
        },
        {
          i: 12,
          color: 'deep-orange',
          name: 'HTML5',
          link: 'https://en.wikipedia.org/wiki/HTML5',
          year: '2012',
          text: 'Web developer @ Tracy PMI'
        },
        {
          i: 13,
          color: 'brown',
          name: 'BootStrap 3',
          link: 'https://en.wikipedia.org/wiki/Bootstrap_(front-end_framework)',
          year: '2013',
          text: 'Frontend Developer @ Amitnet'
        },
        {
          i: 14,
          color: 'red',
          name: 'jQuery',
          link: 'https://en.wikipedia.org/wiki/JQuery',
          year: '2013',
          text: 'Development @ Tracy PMI, Amitnet Solutions & Finance Magnets'
        },
        {
          i: 15,
          color: 'yellow',
          name: 'React',
          link: 'https://en.wikipedia.org/wiki/React_(JavaScript_library)',
          year: '2015',
          text: 'Frontend @ Luneve Solutions'
        },
        {
          i: 16,
          color: 'green',
          name: 'Vue2',
          link: 'https://en.wikipedia.org/wiki/Vue.js',
          year: '2017',
          text: 'Frontend @ Luneve Solutions'
        },
        {
          i: 17,
          color: 'orange',
          name: 'Angular7',
          link:
            'https://en.wikipedia.org/wiki/Angular_(application_platform)#Version_7',
          year: '2018',
          text: 'Frontend @ Luneve Solutions'
        },
        {
          i: 18,
          color: 'purple',
          name: 'Python(Pandas)',
          link: 'https://en.wikipedia.org/wiki/Pandas_(software)',
          year: '2018',
          text:
            'NBA Stats, financial reporting, excel generations. @Luneve Solutions'
        },
        {
          i: 19,
          color: 'teal',
          name: 'Go',
          link: 'https://golang.org/#',
          year: '2018',
          text:
            'Online classes, Udemy Academy, Youtube lessons and home exercises.'
        },
        {
          i: 20,
          color: 'blue',
          name: 'Quasar',
          link: 'https://quasar.dev/',
          year: '2019',
          text:
            'Amaizing Vue Framework, SPA, PWA, SSR, Cordova, Electron, Capacitor and more.'
        },
        {
          i: 21,
          color: 'purple',
          name: 'AWS',
          link: 'https://docs.amplify.aws/lib/q/platform/js',
          year: '2020',
          text: 'Integrating with AWS services using Amplify CLI.'
        },
        {
          i: 22,
          color: 'pink',
          name: 'Self Learning',
          link: 'https://waelio.com',
          year: 'Today...',
          text:
            'Pretty much daily, I perform at least one of following: reading an article, attending an online siminar, watching a youtube lesson or simply refactoring one of my projects.'
        }
      ],
      metaTags: {
        title: 'My Knowledge Timeline',
        description: 'Timeline of my exposure to programming technologies'
      }
    }
  },
  meta
}
</script>
