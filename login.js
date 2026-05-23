const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 31693594;
const apiHash = "9ba82cfa52cc57470b2b1cc3ea619a0d"; 
const stringSession = new StringSession(""); // جلسة جديدة

(async () => {
    console.log("⏳ جاري الاتصال بسيرفرات تليجرام...");
    
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("📱 دخل رقم موبايلك (مع الرمز الدولي مثل +964...): "),
        password: async () => await input.text("🔒 دخل باسورد التحقق بخطوتين (إذا ما عندك اضغط Enter): "),
        phoneCode: async () => await input.text("✉️ دخل الكود اللي وصلك هسه على تليجرام: "),
        onError: (err) => console.log(err),
    });

    console.log("✅ تم تسجيل الدخول بنجاح!");
    console.log("\n🔥 انسخ هذا الكود الطويل (Session String) واحفظه يمك، راح نحتاجه بالسيرفر:");
    console.log("==================================================");
    console.log(client.session.save());
    console.log("==================================================");
    
    process.exit(0);
})();