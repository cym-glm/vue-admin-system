import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: MainLayout,
            redirect: '/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('../views/Dashboard.vue'),
                    meta: { title: '数据仪表盘', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'table',
                    name: 'Table',
                    component: () => import('../views/DataTable.vue'),
                    meta: { title: '数据表格', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'users',
                    name: 'Users',
                    component: () => import('../views/UserManager.vue'),
                    meta: { title: '用户管理', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'permissions',
                    name: 'Permissions',
                    component: () => import('../views/Permissions.vue'),
                    meta: { title: '权限管理', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'components',
                    name: 'ComponentsDocs',
                    component: () => import('../views/Components.vue'),
                    meta: { title: '组件封装', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'table-encap',
                    name: 'TableEncap',
                    component: () => import('../views/TableEncap.vue'),
                    meta: { title: 'table表格封装', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'admin-menu',
                    name: 'AdminMenu',
                    component: () => import('../views/AdminMenu.vue'),
                    meta: { title: 'Admin菜单', roles: ['admin'] },
                },
                {
                    path: 'manager-menu',
                    name: 'ManagerMenu',
                    component: () => import('../views/ManagerMenu.vue'),
                    meta: { title: 'Manager菜单', roles: ['admin', 'manager'] },
                },
                {
                    path: 'user-menu',
                    name: 'UserMenu',
                    component: () => import('../views/UserMenu.vue'),
                    meta: { title: 'User菜单', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'import-file',
                    name: 'ImportFile',
                    component: () => import('../views/ImportFile.vue'),
                    meta: { title: '文件导入', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'export-file',
                    name: 'ExportFile',
                    component: () => import('../views/ExportFile.vue'),
                    meta: { title: '文件导出', roles: ['admin', 'manager', 'user'], i18nModule: 'import-export' },
                },
                {
                    path: 'internationalization',
                    name: 'Internationalization',
                    component: () => import('../views/Internationalization.vue'),
                    meta: { title: '国际化', roles: ['admin', 'manager', 'user'] },
                },
                {
                    path: 'intelligent-agent',
                    name: 'IntelligentAgent',
                    component: () => import('../views/IntelligentAgent.vue'),
                    meta: { title: '智能体', roles: ['admin', 'manager', 'user'] },
                },
            ],
        },
    ],
});

export default router

import { useUserStore } from '@/stores/userStore'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const role = userStore.currentUser.role
  const allowedRoles = to.meta?.roles
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    next('/dashboard')
    return
  }
  next()
})
