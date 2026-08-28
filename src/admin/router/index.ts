import { createRouter, createWebHistory } from 'vue-router'
import AdminAuthLayout from '@admin/layouts/AdminAuthLayout.vue'
import AdminLayout from '@admin/layouts/AdminLayout.vue'
import { adminAuthGuard, adminGuestGuard } from './guards'
import { adminRoutes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/login',
      component: AdminAuthLayout,
      beforeEnter: adminGuestGuard,
      children: [
        {
          path: '',
          name: 'AdminLogin',
          component: () => import('@admin/views/auth/Login.vue'),
          meta: { guestOnly: true, title: 'Admin Login' },
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      beforeEnter: adminAuthGuard,
      children: adminRoutes,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/admin',
    },
  ],
})

router.afterEach((to) => {
  const title = typeof to.meta?.title === 'string' ? to.meta.title : 'Schoolistix Admin'
  document.title = `${title} | Schoolistix`
})

export default router
