// कोर भाषा पैक - हिंदी (लगभग 200 उच्च-आवृत्ति प्रविष्टियां)
// मुख्य बंडल के साथ लोड किया गया, लॉगिन, पंजीकरण, सामान्य संचालन आदि शामिल हैं
export default {
  // सामान्य संचालन
  common: {
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    search: 'खोजें',
    reset: 'रीसेट करें',
    submit: 'सबमिट करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    close: 'बंद करें',
    open: 'खोलें',
    loading: 'लोड हो रहा है...',
    success: 'सफल',
    failed: 'असफल',
    error: 'त्रुटि',
    warning: 'चेतावनी',
    info: 'जानकारी',
    yes: 'हां',
    no: 'नहीं',
    ok: 'ठीक है',
    pleaseSelect: 'कृपया चुनें',
    pleaseInput: 'कृपया दर्ज करें',
    operation: 'संचालन',
    status: 'स्थिति',
    createTime: 'निर्माण समय',
    updateTime: 'अद्यतन समय',
    actions: 'कार्रवाई',
    description: 'विवरण',
    remark: 'टिप्पणी'
  },
  
  // लॉगिन और पंजीकरण
  auth: {
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    register: 'पंजीकरण',
    username: 'उपयोगकर्ता नाम',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    email: 'ईमेल',
    phone: 'फोन',
    rememberMe: 'मुझे याद रखें',
    forgotPassword: 'पासवर्ड भूल गए',
    loginSuccess: 'लॉगिन सफल',
    logoutSuccess: 'लॉगआउट सफल',
    loginFailed: 'लॉगिन विफल',
    invalidUsername: 'अमान्य उपयोगकर्ता नाम प्रारूप',
    invalidPassword: 'अमान्य पासवर्ड प्रारूप',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    userNotExist: 'उपयोगकर्ता मौजूद नहीं है',
    passwordError: 'पासवर्ड त्रुटि',
    accountLocked: 'खाता लॉक है',
    loginExpired: 'लॉगिन समाप्त हो गया, कृपया पुन: लॉगिन करें'
  },
  
  // मेनू और नेविगेशन
  menu: {
    dashboard: 'डैशबोर्ड',
    table: 'डेटा टेबल',
    users: 'उपयोगकर्ता प्रबंधन',
    permissions: 'अनुमति प्रबंधन',
    components: 'घटक दस्तावेज',
    tableEncap: 'टेबल एनकैप्सुलेशन',
    adminMenu: 'एडमिन मेनू',
    managerMenu: 'प्रबंधक मेनू',
    userMenu: 'उपयोगकर्ता मेनू',
    importFile: 'फ़ाइल आयात',
    exportFile: 'फ़ाइल निर्यात',
    internationalization: 'अंतर्राष्ट्रीयकरण'
  },
  
  // उपयोगकर्ता संबंधी
  user: {
    userList: 'उपयोगकर्ता सूची',
    addUser: 'उपयोगकर्ता जोड़ें',
    editUser: 'उपयोगकर्ता संपादित करें',
    deleteUser: 'उपयोगकर्ता हटाएं',
    userName: 'उपयोगकर्ता नाम',
    userRole: 'उपयोगकर्ता भूमिका',
    userStatus: 'उपयोगकर्ता स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    admin: 'एडमिन',
    manager: 'प्रबंधक',
    user: 'उपयोगकर्ता'
  },
  
  // अनुमति संबंधी
  permission: {
    permissionList: 'अनुमति सूची',
    permissionName: 'अनुमति नाम',
    permissionCode: 'अनुमति कोड',
    addPermission: 'अनुमति जोड़ें',
    editPermission: 'अनुमति संपादित करें',
    deletePermission: 'अनुमति हटाएं'
  },
  
  // टेबल संबंधी
  table: {
    noData: 'कोई डेटा नहीं',
    total: 'कुल {total} आइटम',
    page: 'पृष्ठ {current} / {pages}',
    pageSize: 'प्रति पृष्ठ आइटम',
    goToPage: 'पृष्ठ पर जाएं',
    refresh: 'रिफ्रेश करें',
    export: 'निर्यात',
    import: 'आयात',
    batchDelete: 'बैच हटाएं',
    batchOperation: 'बैच संचालन',
    selectAll: 'सभी चुनें',
    deselectAll: 'चयन रद्द करें'
  },
  
  // संदेश
  message: {
    saveSuccess: 'सफलतापूर्वक सहेजा गया',
    saveFailed: 'सहेजने में विफल',
    deleteSuccess: 'सफलतापूर्वक हटाया गया',
    deleteFailed: 'हटाने में विफल',
    operationSuccess: 'संचालन सफल',
    operationFailed: 'संचालन विफल',
    confirmDelete: 'क्या आप वाकई हटाना चाहते हैं?',
    noDataSelected: 'कृपया पहले डेटा चुनें',
    dataLoading: 'डेटा लोड हो रहा है...',
    networkError: 'नेटवर्क त्रुटि, कृपया बाद में पुन: प्रयास करें',
    unauthorized: 'अनधिकृत, कृपया पहले लॉगिन करें',
    forbidden: 'पहुंच निषिद्ध'
  },
  
  // फॉर्म सत्यापन
  validation: {
    required: 'यह फ़ील्ड आवश्यक है',
    email: 'कृपया एक वैध ईमेल पता दर्ज करें',
    phone: 'कृपया एक वैध फ़ोन नंबर दर्ज करें',
    minLength: 'लंबाई कम से कम {min} वर्ण होनी चाहिए',
    maxLength: 'लंबाई {max} वर्णों से अधिक नहीं होनी चाहिए',
    pattern: 'अमान्य प्रारूप',
    number: 'कृपया एक संख्या दर्ज करें',
    integer: 'कृपया एक पूर्णांक दर्ज करें',
    positive: 'कृपया एक धनात्मक संख्या दर्ज करें',
    url: 'कृपया एक वैध URL दर्ज करें'
  },
  
  // समय संबंधी
  time: {
    today: 'आज',
    yesterday: 'कल',
    thisWeek: 'इस सप्ताह',
    lastWeek: 'पिछले सप्ताह',
    thisMonth: 'इस महीने',
    lastMonth: 'पिछले महीने',
    thisYear: 'इस वर्ष',
    lastYear: 'पिछले वर्ष',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम'
  },
  
  // अंतर्राष्ट्रीयकरण संबंधी
  i18n: {
    languageSettings: 'भाषा सेटिंग्स',
    currentLanguage: 'वर्तमान भाषा',
    languagePreview: 'भाषा पूर्वावलोकन',
    languagePackInfo: 'भाषा पैक जानकारी',
    corePackSize: 'कोर पैक आकार',
    loadedWithMainBundle: 'मुख्य बंडल के साथ लोड',
    totalEntries: 'कुल प्रविष्टियां',
    entries: 'प्रविष्टियां',
    coreEntries: 'कोर प्रविष्टियां',
    moduleEntries: 'मॉड्यूल प्रविष्टियां',
    lazyLoaded: 'आलसी लोड',
    supportedLanguages: 'समर्थित भाषाएं',
    loadedModules: 'लोड किए गए मॉड्यूल',
    moduleName: 'मॉड्यूल नाम',
    loadStatus: 'लोड स्थिति',
    loaded: 'लोड किया गया',
    notLoaded: 'लोड नहीं किया गया',
    operations: 'संचालन',
    loadModule: 'मॉड्यूल लोड करें',
    alreadyLoaded: 'पहले से लोड है',
    languageChanged: 'भाषा सफलतापूर्वक बदली गई',
    languageChangeFailed: 'भाषा बदलने में विफल',
    moduleAlreadyLoaded: 'मॉड्यूल पहले से लोड है',
    moduleLoadedSuccess: 'मॉड्यूल सफलतापूर्वक लोड किया गया',
    moduleLoadFailed: 'मॉड्यूल लोड विफल',
    moduleLoadError: 'मॉड्यूल लोड त्रुटि'
  }
}

