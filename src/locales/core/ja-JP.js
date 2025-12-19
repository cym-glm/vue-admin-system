// コア言語パック - 日本語（約200の高頻度エントリ）
// メインバンドルと一緒にロードされ、ログイン、登録、一般的な操作などを含む
export default {
  // 一般的な操作
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    search: '検索',
    reset: 'リセット',
    submit: '送信',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    close: '閉じる',
    open: '開く',
    loading: '読み込み中...',
    success: '成功',
    failed: '失敗',
    error: 'エラー',
    warning: '警告',
    info: '情報',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    pleaseSelect: '選択してください',
    pleaseInput: '入力してください',
    operation: '操作',
    status: 'ステータス',
    createTime: '作成日時',
    updateTime: '更新日時',
    actions: '操作',
    description: '説明',
    remark: '備考'
  },
  
  // ログイン・登録関連
  auth: {
    login: 'ログイン',
    logout: 'ログアウト',
    register: '登録',
    username: 'ユーザー名',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    email: 'メールアドレス',
    phone: '電話番号',
    rememberMe: 'ログイン状態を保持',
    forgotPassword: 'パスワードを忘れた',
    loginSuccess: 'ログイン成功',
    logoutSuccess: 'ログアウト成功',
    loginFailed: 'ログイン失敗',
    invalidUsername: 'ユーザー名の形式が正しくありません',
    invalidPassword: 'パスワードの形式が正しくありません',
    passwordMismatch: 'パスワードが一致しません',
    userNotExist: 'ユーザーが存在しません',
    passwordError: 'パスワードが間違っています',
    accountLocked: 'アカウントがロックされています',
    loginExpired: 'ログインが期限切れです。再度ログインしてください'
  },
  
  // メニューとナビゲーション
  menu: {
    dashboard: 'データダッシュボード',
    table: 'データテーブル',
    users: 'ユーザー管理',
    permissions: '権限管理',
    components: 'コンポーネントドキュメント',
    tableEncap: 'テーブルカプセル化',
    adminMenu: '管理者メニュー',
    managerMenu: 'マネージャーメニュー',
    userMenu: 'ユーザーメニュー',
    importFile: 'ファイルインポート',
    exportFile: 'ファイルエクスポート',
    internationalization: '国際化'
  },
  
  // ユーザー関連
  user: {
    userList: 'ユーザーリスト',
    addUser: 'ユーザー追加',
    editUser: 'ユーザー編集',
    deleteUser: 'ユーザー削除',
    userName: 'ユーザー名',
    userRole: 'ユーザーロール',
    userStatus: 'ユーザーステータス',
    active: '有効',
    inactive: '無効',
    admin: '管理者',
    manager: 'マネージャー',
    user: '一般ユーザー'
  },
  
  // 権限関連
  permission: {
    permissionList: '権限リスト',
    permissionName: '権限名',
    permissionCode: '権限コード',
    addPermission: '権限追加',
    editPermission: '権限編集',
    deletePermission: '権限削除'
  },
  
  // テーブル関連
  table: {
    noData: 'データがありません',
    total: '合計 {total} 件',
    page: '{current} ページ / {pages} ページ',
    pageSize: 'ページあたりの表示数',
    goToPage: 'ページへ移動',
    refresh: '更新',
    export: 'エクスポート',
    import: 'インポート',
    batchDelete: '一括削除',
    batchOperation: '一括操作',
    selectAll: 'すべて選択',
    deselectAll: '選択解除'
  },
  
  // メッセージ
  message: {
    saveSuccess: '保存しました',
    saveFailed: '保存に失敗しました',
    deleteSuccess: '削除しました',
    deleteFailed: '削除に失敗しました',
    operationSuccess: '操作が成功しました',
    operationFailed: '操作に失敗しました',
    confirmDelete: '削除してもよろしいですか？',
    noDataSelected: 'まずデータを選択してください',
    dataLoading: 'データを読み込み中...',
    networkError: 'ネットワークエラー。後でもう一度お試しください',
    unauthorized: '認証されていません。先にログインしてください',
    forbidden: 'アクセス禁止'
  },
  
  // フォーム検証
  validation: {
    required: 'この項目は必須です',
    email: '正しいメールアドレスを入力してください',
    phone: '正しい電話番号を入力してください',
    minLength: '長さは {min} 文字以上である必要があります',
    maxLength: '長さは {max} 文字を超えることはできません',
    pattern: '形式が正しくありません',
    number: '数値を入力してください',
    integer: '整数を入力してください',
    positive: '正の数を入力してください',
    url: '正しいURLを入力してください'
  },
  
  // 時間関連
  time: {
    today: '今日',
    yesterday: '昨日',
    thisWeek: '今週',
    lastWeek: '先週',
    thisMonth: '今月',
    lastMonth: '先月',
    thisYear: '今年',
    lastYear: '昨年',
    morning: '午前',
    afternoon: '午後',
    evening: '夜'
  },
  
  // 国際化関連
  i18n: {
    languageSettings: '言語設定',
    currentLanguage: '現在の言語',
    languagePreview: '言語プレビュー',
    languagePackInfo: '言語パック情報',
    corePackSize: 'コアパックサイズ',
    loadedWithMainBundle: 'メインバンドルと一緒にロード',
    totalEntries: '総エントリ数',
    entries: 'エントリ',
    coreEntries: 'コアエントリ数',
    moduleEntries: 'モジュールエントリ数',
    lazyLoaded: '遅延読み込み',
    supportedLanguages: 'サポート言語',
    loadedModules: 'ロード済みモジュール',
    moduleName: 'モジュール名',
    loadStatus: 'ロードステータス',
    loaded: 'ロード済み',
    notLoaded: '未ロード',
    operations: '操作',
    loadModule: 'モジュールをロード',
    alreadyLoaded: '既にロード済み',
    languageChanged: '言語が正常に変更されました',
    languageChangeFailed: '言語の変更に失敗しました',
    moduleAlreadyLoaded: 'モジュールは既にロードされています',
    moduleLoadedSuccess: 'モジュールが正常にロードされました',
    moduleLoadFailed: 'モジュールのロードに失敗しました',
    moduleLoadError: 'モジュールのロードエラー'
  }
}

