// 核心语言包 - 中文（约200个高频词条）
// 与主包一起加载，包含登录、注册、通用操作等常用词条
export default {
  // 通用操作
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    open: '打开',
    loading: '加载中...',
    success: '成功',
    failed: '失败',
    error: '错误',
    warning: '警告',
    info: '信息',
    yes: '是',
    no: '否',
    ok: '确定',
    pleaseSelect: '请选择',
    pleaseInput: '请输入',
    operation: '操作',
    status: '状态',
    createTime: '创建时间',
    updateTime: '更新时间',
    actions: '操作',
    description: '描述',
    remark: '备注'
  },
  
  // 登录注册相关
  auth: {
    login: '登录',
    logout: '退出登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    email: '邮箱',
    phone: '手机号',
    rememberMe: '记住我',
    forgotPassword: '忘记密码',
    loginSuccess: '登录成功',
    logoutSuccess: '退出成功',
    loginFailed: '登录失败',
    invalidUsername: '用户名格式不正确',
    invalidPassword: '密码格式不正确',
    passwordMismatch: '两次输入的密码不一致',
    userNotExist: '用户不存在',
    passwordError: '密码错误',
    accountLocked: '账户已被锁定',
    loginExpired: '登录已过期，请重新登录'
  },
  
  // 菜单和导航
  menu: {
    dashboard: '数据仪表盘',
    table: '数据表格',
    users: '用户管理',
    permissions: '权限管理',
    components: '组件封装',
    tableEncap: '表格封装',
    adminMenu: 'Admin菜单',
    managerMenu: 'Manager菜单',
    userMenu: 'User菜单',
    importFile: '文件导入',
    exportFile: '文件导出',
    internationalization: '国际化'
  },
  
  // 用户相关
  user: {
    userList: '用户列表',
    addUser: '添加用户',
    editUser: '编辑用户',
    deleteUser: '删除用户',
    userName: '用户名',
    userRole: '用户角色',
    userStatus: '用户状态',
    active: '启用',
    inactive: '禁用',
    admin: '管理员',
    manager: '经理',
    user: '普通用户'
  },
  
  // 权限相关
  permission: {
    permissionList: '权限列表',
    permissionName: '权限名称',
    permissionCode: '权限代码',
    addPermission: '添加权限',
    editPermission: '编辑权限',
    deletePermission: '删除权限'
  },
  
  // 表格相关
  table: {
    noData: '暂无数据',
    total: '共 {total} 条',
    page: '第 {current} 页，共 {pages} 页',
    pageSize: '每页显示',
    goToPage: '跳转到',
    refresh: '刷新',
    export: '导出',
    import: '导入',
    batchDelete: '批量删除',
    batchOperation: '批量操作',
    selectAll: '全选',
    deselectAll: '取消全选'
  },
  
  // 消息提示
  message: {
    saveSuccess: '保存成功',
    saveFailed: '保存失败',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    operationSuccess: '操作成功',
    operationFailed: '操作失败',
    confirmDelete: '确定要删除吗？',
    noDataSelected: '请先选择数据',
    dataLoading: '数据加载中...',
    networkError: '网络错误，请稍后重试',
    unauthorized: '未授权，请先登录',
    forbidden: '无权限访问'
  },
  
  // 表单验证
  validation: {
    required: '此字段为必填项',
    email: '请输入正确的邮箱地址',
    phone: '请输入正确的手机号码',
    minLength: '长度不能少于 {min} 个字符',
    maxLength: '长度不能超过 {max} 个字符',
    pattern: '格式不正确',
    number: '请输入数字',
    integer: '请输入整数',
    positive: '请输入正数',
    url: '请输入正确的URL地址'
  },
  
  // 时间相关
  time: {
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    lastWeek: '上周',
    thisMonth: '本月',
    lastMonth: '上月',
    thisYear: '今年',
    lastYear: '去年',
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
  },
  
  // 国际化相关
  i18n: {
    languageSettings: '语言设置',
    currentLanguage: '当前语言',
    languagePreview: '语言预览',
    languagePackInfo: '语言包信息',
    corePackSize: '核心包大小',
    loadedWithMainBundle: '与主包一起加载',
    totalEntries: '总词条数',
    entries: '个词条',
    coreEntries: '核心词条数',
    moduleEntries: '模块词条数',
    lazyLoaded: '按需加载',
    supportedLanguages: '支持的语言',
    loadedModules: '已加载模块',
    moduleName: '模块名称',
    loadStatus: '加载状态',
    loaded: '已加载',
    notLoaded: '未加载',
    operations: '操作',
    loadModule: '加载模块',
    alreadyLoaded: '已加载',
    languageChanged: '语言切换成功',
    languageChangeFailed: '语言切换失败',
    moduleAlreadyLoaded: '模块已加载',
    moduleLoadedSuccess: '模块加载成功',
    moduleLoadFailed: '模块加载失败',
    moduleLoadError: '模块加载出错'
  }
}

