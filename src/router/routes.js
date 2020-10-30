const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: '/todo',
        name: 'todo',
        component: () => import('pages/Todo.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/privacy',
        name: 'privacy',
        component: () => import('pages/Privacy')
      },
      {
        path: '/contact',
        name: 'contact',
        component: () => import('pages/ContactUs')
      },
      {
        path: '/terms',
        name: 'terms',
        component: () => import('pages/Terms')
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: () => import('pages/TimeLine')
      },
      {
        path: '/resume',
        name: 'resume',
        component: () => import('pages/Resume')
      },
      // Projects
      {
        path: '/projects',
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
      // Apps
      {
        path: '/apps',
        name: 'apps',
        component: () => import('pages/Apps/index'),
        children: [
          {
            path: '/favsshuffler',
            name: 'favsshuffler',
            component: () => import('pages/Apps/FavsShuffler/index.vue'),
            children: [
              {
                path: '/support',
                name: 'support',
                component: () => import('pages/Apps/FavsShuffler/Support')
              }
            ]
          }
        ]
      },
      {
        // Protected Routes
        path: '/auth',
        component: () => import('pages/Auth.vue'),
        name: 'auth',
        meta: {
          requiresAuth: false
        },
        children: [
          {
            path: '/profile',
            name: 'profile',
            component: () => import('pages/Profile.vue'),
            meta: {
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: '*',
        component: () => import('pages/Error404.vue')
      }
    ]
  }
]

export default routes
