import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../stores/auth';

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/', component: () => import('../views/MenuView.vue') },
  {
    path: '/manage',
    component: () => import('../views/admin/ManageLayout.vue'),
    children: [
      { path: '', redirect: '/manage/dishes' },
      { path: 'dishes', component: () => import('../views/admin/DishManage.vue') },
      { path: 'materials', component: () => import('../views/admin/MaterialManage.vue') },
      { path: 'categories', component: () => import('../views/admin/CategoryManage.vue') },
      { path: 'settings', component: () => import('../views/admin/SettingsView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  if (to.path !== '/login' && !auth.isLogin) return '/login';
  if (to.path === '/login' && auth.isLogin) return '/';
});

export default router;
