
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'todo',
        name: 'todo',
        component: () => import('pages/Todo.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('pages/Privacy')
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('pages/ContactUs')
      },
      {
        path: 'terms',
        name: 'terms',
        component: () => import('pages/Terms')
      },
      {
        path: 'timeline',
        name: 'timeline',
        component: () => import('pages/TimeLine')
      },
      {
        path: 'resume',
        name: 'resume',
        component: () => import('pages/Resume')
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('pages/Projects/index'),
        children: [
          {
            path: ':projectName',
            name: 'oneproject',
            component: () => import('pages/Projects/index')
          }
        ]
      },
      {
        path: 'apps',
        name: 'apps',
        component: () => import('pages/Apps/index'),
        children: [
          {
            path: 'favsshuffler',
            name: 'favsshuffler',
            component: () => import('pages/Apps/FavsShuffler/index.vue'),
            children: [
              {
                path: 'support',
                name: 'support',
                component: () => import('pages/Apps/FavsShuffler/Support')
              }
            ]
          }
        ]
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/Auth.vue')
      }
    ]
  },
  { // Protected Routes
    path: '/auth',
    // beforeEnter: (to, from, next) => {
    //   window.location = 'https://auth.waelio.com/login?client_id=2erlvso7q5ufgss3cl2c0acerv&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/'
    // }
    component: () => import('layouts/MyLayout.vue'),
    children: [{
      path: '',
      name: 'auth',
      component: () => import('pages/Auth.vue'),
      meta: {
        requiresAuth: false
      }
    }]
  },
  {
    path: '/profile',
    component: () => import('layouts/MyLayout.vue'),
    children: [{
      name: 'profile',
      path: '',
      component: () => import('pages/Profile.vue'),
      meta: {
        requiresAuth: true
      }
    }]
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
