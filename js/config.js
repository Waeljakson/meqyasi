// إعدادات المنصة — عدّل هذا الملف فقط لربط Appwrite.
// اترك projectId فارغاً لتعمل المنصة في "الوضع التجريبي" (الحفظ على الجهاز فقط).
window.APP_CONFIG = {
  appName: 'مقياسي',
  endpoint: 'https://fra.cloud.appwrite.io/v1', // Endpoint من إعدادات مشروع Appwrite
  projectId: '6af60a8400323e1941e0',                            // Project ID
  databaseId: '6af61245000ab2cb25cb',                      // معرّف قاعدة البيانات
  tableId: 'results',                         // جدول النتائج
  profilesTableId: 'profiles',                // جدول بيانات المستخدمين (للإدارة)
  blocksTableId: 'blocks',
  membersTableId: 'members',                  // أفراد الأسرة
  intakesTableId: 'intakes',                  // استمارات تاريخ الحالة
  settingsTableId: 'settings',                // إعدادات الدفع (يعدّلها المدير من اللوحة)
  payreqTableId: 'payreq',                    // طلبات الاشتراك وإثباتات الدفع
  subsTableId: 'subs',                        // الاشتراكات المفعّلة
  saveFunctionId: 'saveResult',               // دالة الخادم التي تحفظ النتائج وتطبّق الحد المجاني
  freeLimit: 2,                               // عدد المقاييس المجانية قبل الاشتراك
  disabledScales: [],                         // معرّفات مقاييس تُخفى من المنصة، مثل ['igds9','smfq']
  // القيم الافتراضية لبيانات الدفع. رقم الحساب والآيبان وصور QR يدخلها المدير من لوحة الإدارة ولا تُكتب هنا.
  pay: {
    eg: { price: '50 جنيهاً مصرياً شهرياً', vodafone: '01067908302', instapay: 'waeljaksonstar@instapay' },
    sa: { price: '10 ريالات سعودية شهرياً', bank: 'مصرف الراجحي', name: 'محمد صلاح الدين محمد الجمل', account: '', iban: '', swift: '' }
  },
  notesTableId: 'notes',                      // ملاحظات المدير على الحالات
  siteUrl: 'https://waeljakson.github.io/meqyasi/', // رابط المنصة (لرسالة استعادة كلمة المرور)                    // جدول الحسابات الموقوفة
  // نص يظهر عند وجود مؤشر خطر عاجل — ضع هنا أرقام الجهات المعتمدة في بلدك/مؤسستك.
  urgentHelp: 'إذا كانت تراودك أفكار بإيذاء نفسك أو كنت في خطر الآن: تحدث فوراً مع شخص بالغ تثق به، واتصل بخدمات الطوارئ في بلدك أو توجه إلى أقرب قسم طوارئ.'
};
