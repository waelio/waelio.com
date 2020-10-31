import MyLayout from 'layouts/MyLayout'
import IndexPage from 'pages/Index'
import Todo from 'pages/Todo'
import Privacy from 'pages/Privacy'
import Terms from 'pages/Terms'
import Contact from 'pages/ContactUs'
import TimeLine from 'pages/TimeLine'
import Projects from 'pages/Projects/index'
import Resume from 'pages/Resume'
import AppsIndex from 'pages/Apps/index'
import FavsShuffler from 'pages/Apps/FavsShuffler/index'
import FavsShufflerSupport from 'pages/Apps/FavsShuffler/Support'
import AuthPage from 'pages/Auth'
import Profile from 'pages/Profile'
import Page404 from 'pages/Error404'

const routes = [
  {
    path: '/',
    component: MyLayout,
    children: [
      { path: '', component: IndexPage },
      {
        path: '/todo',
        name: 'todo',
        component: Todo,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/privacy',
        name: 'privacy',
        component: Privacy
      },
      {
        path: '/contact',
        name: 'contact',
        component: Contact
      },
      {
        path: '/terms',
        name: 'terms',
        component: Terms
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: TimeLine
      },
      {
        path: '/resume',
        name: 'resume',
        component: Resume
      },
      // Projects
      {
        path: '/projects',
        name: 'projects',
        component: Projects,
        children: [
          {
            path: ':projectName',
            name: 'oneproject',
            component: Projects
          }
        ]
      },
      // Apps
      {
        path: '/apps',
        name: 'apps',
        component: AppsIndex,
        children: [
          {
            path: 'favsshuffler',
            name: 'favsshuffler',
            component: FavsShuffler,
            children: [
              {
                path: 'support',
                name: 'support',
                component: FavsShufflerSupport
              }
            ]
          }
        ]
      },
      {
        // Protected Routes
        path: '/auth',
        name: 'auth',
        component: AuthPage,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'auth/profile',
        name: 'profile',
        component: Profile,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '*',
        component: Page404
      }
    ]
  }
]

export default routes
