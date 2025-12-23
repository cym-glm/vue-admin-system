import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const ROLE_PERMISSIONS = {
  admin: ['user.view', 'user.create', 'user.edit', 'user.delete', 'chart.view', 'chart.export'],
  manager: ['user.view', 'user.edit', 'chart.view', 'chart.export'],
  user: ['user.view', 'chart.view']
}

export const useUserStore = defineStore('user', () => {
  const savedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null
  const currentUser = ref({
    name: '管理员',
    role: savedRole || 'admin'
  })

  const menus = ref([])

  const hasPermission = (permission) => {
    const permissions = ROLE_PERMISSIONS[currentUser.value.role] || []
    return permissions.includes(permission)
  }

  const switchRole = (role) => {
    currentUser.value.role = role
    currentUser.value.name = role === 'admin' ? '管理员' : (role === 'manager' ? '赵六经理' : '普通用户')
    try { localStorage.setItem('role', role) } catch {}
  }

  const ALL_MENUS = [
      { path: '/dashboard', title: '数据仪表盘', roles: ['admin', 'manager', 'user'], icon: 'DataLine' },
      { path: '/table', title: '数据表格', roles: ['admin', 'manager', 'user'], icon: 'Grid' },
      { path: '/users', title: '用户管理', roles: ['admin', 'manager', 'user'], icon: 'User' },
      { path: '/permissions', title: '权限管理', roles: ['admin', 'manager', 'user'], icon: 'Lock' },
      { path: '/components', title: '组件封装', roles: ['admin', 'manager', 'user'], icon: 'Collection' },
      { path: '/table-encap', title: 'table表格封装', roles: ['admin', 'manager', 'user'], icon: 'List' },
      { path: '/admin-menu', title: 'Admin菜单', roles: ['admin'], icon: 'Setting' },
      { path: '/manager-menu', title: 'Manager菜单', roles: ['admin', 'manager'], icon: 'Management' },
      { path: '/user-menu', title: 'User菜单', roles: ['admin', 'manager', 'user'], icon: 'UserFilled' },
      { path: '/import-file', title: '文件导入', roles: ['admin', 'manager', 'user'], icon: 'Upload' },
      { path: '/export-file', title: '文件导出', roles: ['admin', 'manager', 'user'], icon: 'Download' },
      { path: '/internationalization', title: '国际化', roles: ['admin', 'manager', 'user'], icon: 'Operation' },
      { path: '/intelligent-agent', title: '智能体', roles: ['admin', 'manager', 'user'], icon: 'ChatDotRound' },
  ];

  const loadMenus = async () => {
    const role = currentUser.value.role
    try {
      const res = await fetch(`/api/menus?role=${role}`)
      if (!res.ok) throw new Error('bad status')
      const data = await res.json()
      menus.value = Array.isArray(data) ? data : []
    } catch (e) {
      menus.value = ALL_MENUS.filter(m => m.roles.includes(role))
    }
  }

  watch(() => currentUser.value.role, () => {
    loadMenus()
  }, { immediate: true })

  return {
    currentUser,
    hasPermission,
    switchRole,
    ROLE_PERMISSIONS,
    menus,
    loadMenus
  }
})
