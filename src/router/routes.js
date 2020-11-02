import MyLayout from 'layouts/MyLayout'
import IndexPage from 'pages/Index'
import Privacy from 'pages/Privacy'
import Credits from 'pages/Credits'
import Terms from 'pages/Terms'
import Contact from 'pages/ContactUs'
import TimeLine from 'pages/TimeLine'
import InstagramFeed from 'pages/InstagramFeed'
import Projects from 'pages/Projects/index'
import MyResume from 'pages/MyResume'
import AppsIndex from 'pages/Apps/index'
import FavsShuffler from 'pages/Apps/FavsShuffler/index'
import FavsShufflerSupport from 'pages/Apps/FavsShuffler/Support'
import AuthPage from 'pages/Auth/index'
import Authentication from 'pages/Auth/Authentication'
import Profile from 'pages/Auth/Profile'
import ShoppingListsIndex from 'pages/Apps/ShoppingLists/index'
import ShoppingLists from 'pages/Apps/ShoppingLists/ShoppingLists'
import ShoppingItem from 'pages/Apps/ShoppingLists/ShoppingItem'
import Page404 from 'pages/Error404'

const routes = [
  {
    path: '/',
    component: MyLayout,
    children: [
      { path: '', component: IndexPage },
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
        path: '/instagram',
        name: 'instagramfeed',
        component: InstagramFeed
      },
      {
        path: '/credits',
        name: 'credits',
        component: Credits
      },
      {
        path: '/resume',
        name: 'resume',
        component: MyResume
      },
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
          },
          {
            path: 'shoppinglists',
            name: 'shoppinglists',
            component: ShoppingListsIndex,
            meta: {
              requiresAuth: true
            },
            children: [
              {
                path: 'lists',
                name: 'lists',
                component: ShoppingLists,
                meta: {
                  requiresAuth: true
                }
              },
              {
                path: 'list/:id',
                name: 'list',
                component: ShoppingItem,
                meta: {
                  requiresAuth: true
                }
              }
            ]
          }
        ]
      },
      {
        path: '/auth',
        name: 'auth',
        component: AuthPage,
        meta: {
          requiresAuth: true
        },
        children: [
          {
            path: 'authenticate',
            name: 'authenticate',
            component: Authentication,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'profile',
            name: 'profile',
            component: Profile,
            meta: {
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: '*',
        component: Page404
      }
    ]
  }
]

export default routes
