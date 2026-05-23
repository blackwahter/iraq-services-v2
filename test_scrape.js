const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
    const channels = ['roatabn', 'iraqnow4', 'omeralij', 'marwaan1980'];
    const salaryKeywords = ['راتب', 'رواتب', 'تمويل', 'مصرف', 'متقاعدين', 'الرعاية', 'صرف', 'موظفي', 'المالية', 'سلفة', 'سلف', 'إطلاق', 'باشر', 'عاجل'];
    for(let channel of channels) {
        try {
            const response = await axios.get(`https://t.me/s/${channel}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(response.data);
            const messages = $('.tgme_widget_message_text');
            console.log(`Channel ${channel} has ${messages.length} messages`);
            const numMessagesToCheck = Math.min(messages.length, 5);
            for (let i = messages.length - numMessagesToCheck; i < messages.length; i++) {
                let msgText = $(messages[i]).text().trim();
                const isSalaryNews = salaryKeywords.some(keyword => msgText.includes(keyword));
                if(isSalaryNews) {
                    console.log(`FOUND IN ${channel}: ${msgText.substring(0, 50)}...`);
                }
            }
        } catch(e) {
            console.error(`Error in ${channel}:`, e.message);
        }
    }
}
test();
