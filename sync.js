const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// 1. Настройка Supabase и CRM
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);
const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;

async function syncOrders() {
  console.log('🔄 Начинаю процесс синхронизации...');

  try {
    // 2. Получаем заказы из RetailCRM
    // Мы берем последние 50 заказов
    const response = await axios.get(`${CRM_URL}/api/v5/orders`, {
      params: {
        apiKey: API_KEY,
        limit: 50,
      },
    });

    if (!response.data.success) {
      throw new Error(
        'Ошибка API RetailCRM: ' + JSON.stringify(response.data.errors),
      );
    }

    const crmOrders = response.data.orders;
    console.log(`📥 Получено из CRM: ${crmOrders.length} заказов.`);

    for (const order of crmOrders) {
      // 3. Сохраняем (или обновляем) заказ в Supabase
      // Метод .upsert() проверяет ID: если такой ID уже есть, он обновит данные, если нет - создаст.
      const { error: supabaseError } = await supabase.from('orders').upsert({
        id: order.id,
        external_id: order.externalId,
        customer_name: order.firstName || 'Без имени',
        total_sum: order.totalSumm,
        status: order.status,
        created_at: order.createdAt,
      });

      if (supabaseError) {
        console.error(
          `❌ Ошибка Supabase для заказа #${order.id}:`,
          supabaseError.message,
        );
      } else {
        console.log(`✅ Заказ #${order.id} синхронизирован.`);

        // 4. Шаг 5: Проверка суммы заказа для Telegram (> 50,000 ₸)
        if (order.totalSumm > 50000) {
          await sendTelegramNotification(order.totalSumm, order.firstName);
        }
      }
    }

    console.log('\n🏁 Синхронизация успешно завершена!');
  } catch (error) {
    console.error('🔥 Критическая ошибка синхронизации:');
    console.error(error.message);
  }
}

// Функция для отправки уведомления в Telegram
async function sendTelegramNotification(sum, name) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    // Если бот не настроен, просто пропускаем
    return;
  }

  const message =
    `💰 *Более 50,000 ₸*\n\n` +
    `👤 Клиент: ${name || 'Не указан'}\n` +
    `💵 Сумма: ${sum.toLocaleString()} ₸\n` +
    `🚀 Статус: Новый`;

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log(`📢 Уведомление отправлено в Telegram для: ${name}`);
  } catch (tgError) {
    console.error('❌ Ошибка отправки в Telegram:', tgError.message);
  }
}

// Запуск функции
syncOrders();
