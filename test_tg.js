const axios = require('axios');
require('dotenv').config();

async function testTG() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const x = 10; // создаем переменную, но не используем её
  console.log('Проверка связи с Telegram...');

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: '🚀 Тестовое уведомление: Связь с дашбордом установлена!',
      parse_mode: 'Markdown',
    });
    console.log('✅ Сообщение улетело! Проверь Telegram.');
  } catch (err) {
    console.error('❌ Ошибка:', err.response?.data || err.message);
  }
}

testTG();
