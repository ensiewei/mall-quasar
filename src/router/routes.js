
const routes = [
  {
    path: '/',
    component: () => import('components/Home.vue')
  },

  {
    path: '/home',
    component: () => import('components/Home.vue')
  },

  {
    path: '/cart',
    component: () => import('components/Cart.vue')
  },

  {
    path: '/mine',
    component: () => import('components/Mine.vue')
  },

  {
    path: '/search',
    component: () => import('components/Search.vue')
  },

  {
    path: '/order',
    component: () => import('components/Order.vue')
  },

  {
    path: '/login',
    component: () => import('components/Login.vue')
  },

  {
    path: '/register',
    component: () => import('components/Register.vue')
  },

  {
    path: '/:id(\\d+)',
    component: () => import('components/Sku.vue')
  },

  {
    path: '/submit',
    name: 'Submit',
    component: () => import('components/Submit.vue')
  },

  {
    path: '/address',
    component: () => import('components/Address.vue')
  },

  {
    path: '/addAddress',
    component: () => import('components/AddAddress.vue')
  },

  {
    path: '/modifyAddress',
    component: () => import('components/ModifyAddress.vue')
  },

  {
    path: '/orderDetail',
    component: () => import('components/OrderDetail.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
