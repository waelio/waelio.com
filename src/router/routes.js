
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
        path: 'login',
        name: 'login',
        component: () => import('pages/Auth.vue')
      }
    ]
  },
  { // Protected Routes
    path: '/auth',
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
