const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// 1. Проверка переменных окружения
const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;
const SITE_CODE = process.env.RETAILCRM_SITE_CODE;

console.log('🚀 Скрипт запущен');
console.log(`URL: ${CRM_URL}`);
console.log(`Магазин: ${SITE_CODE}`);

// ТЕСТОВЫЙ РЕЖИМ: true - 1 заказ, false - все 50
const IS_TEST_MODE = false;

async function upload() {
  try {
    // 2. Проверка файла с данными
    if (!fs.existsSync('mock_orders.json')) {
      console.error('❌ Ошибка: Файл mock_orders.json не найден!');
      return;
    }

    const rawData = fs.readFileSync('mock_orders.json', 'utf8');
    const allOrders = JSON.parse(rawData);

    const ordersToUpload = IS_TEST_MODE ? [allOrders[0]] : allOrders;
    console.log(`📦 Подготовлено заказов к загрузке: ${ordersToUpload.length}`);

    for (let i = 0; i < ordersToUpload.length; i++) {
      const order = ordersToUpload[i];

      // Расчет суммы позиций
      let calculatedTotal = 0;
      const items = order.items.map((item) => {
        calculatedTotal += item.quantity * item.initialPrice;
        return {
          initialPrice: item.initialPrice,
          quantity: item.quantity,
          offer: { name: item.productName },
        };
      });

      // Формируем объект заказа (используем orderType: 'main' из твоих логов)
      const orderPayload = {
        externalId: `order_hh_${Date.now()}_${i}`,
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        email: order.email,
        status: 'new',
        orderType: 'main',
        orderMethod: 'shopping-cart',
        items: items,
        totalSumm: calculatedTotal,
        delivery: {
          address: {
            city: order.delivery.address.city,
            text: order.delivery.address.text,
          },
        },
      };

      // Подготовка параметров для POST запроса
      const params = new URLSearchParams();
      params.append('apiKey', API_KEY);
      params.append('site', SITE_CODE);
      params.append('order', JSON.stringify(orderPayload));

      console.log(`📡 Отправляю заказ для: ${order.firstName}...`);

      const response = await axios.post(
        `${CRM_URL}/api/v5/orders/create`,
        params,
      );

      if (response.data.success) {
        console.log(`✅ Успех! Заказ создан. ID в CRM: ${response.data.id}`);
      } else {
        console.error(
          `❌ Ошибка от API для ${order.firstName}:`,
          response.data.errors,
        );
      }

      // Пауза 0.5 сек между заказами, чтобы API не заблокировало
      if (!IS_TEST_MODE) {
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    console.log('\n🏁 Работа скрипта завершена.');
  } catch (error) {
    console.error('🔥 Произошла критическая ошибка:');
    if (error.response) {
      console.error('Данные от сервера:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// ВАЖНО: Вызов функции, без него ничего не произойдет!
upload();
