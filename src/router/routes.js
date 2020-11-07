import MyLayout from 'layouts/MyLayout'
import IndexPage from 'pages/Index'
import Page404 from 'pages/Error404'

import Privacy from 'pages/General/Privacy'
import Credits from 'pages/General/Credits'
import Terms from 'pages/General/Terms'
import Contact from 'pages/General/ContactUs'
import TimeLine from 'pages/General/TimeLine'
import InstagramFeed from 'pages/General/InstagramFeed'
import MyResume from 'pages/General/MyResume'
import Wael from 'pages/General/Wael'

import Projects from 'pages/Projects/index'

import FavsShuffler from 'pages/Apps/FavsShuffler/index'
import FavsShufflerSupport from 'pages/Apps/FavsShuffler/Support'

import AuthPage from 'pages/Auth/index'
import Authentication from 'pages/Auth/Authentication'
import Profile from 'pages/Auth/Profile'

import AppsIndex from 'pages/Apps/index'
import ShoppingListsIndex from 'pages/Apps/ShoppingLists/index'
import ShoppingLists from 'pages/Apps/ShoppingLists/ShoppingLists'
import ShoppingItem from 'pages/Apps/ShoppingLists/ShoppingItem'

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
        path: '/wael',
        name: 'wael',
        component: Wael
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: TimeLine
      },
      {
        path: '/terms',
        name: 'terms',
        component: Terms
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
