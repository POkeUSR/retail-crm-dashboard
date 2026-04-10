const axios = require('axios');
require('dotenv').config();

const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;

async function checkCRMConfig() {
  console.log('🔍 Начинаю проверку справочников в RetailCRM...\n');

  const endpoints = [
    {
      name: 'Статусы заказов',
      url: '/api/v5/reference/statuses',
      key: 'statuses',
    },
    {
      name: 'Типы заказов',
      url: '/api/v5/reference/order-types',
      key: 'orderTypes',
    },
    {
      name: 'Методы оформления',
      url: '/api/v5/reference/order-methods',
      key: 'orderMethods',
    },
    {
      name: 'Пользовательские поля',
      url: '/api/v5/reference/custom-fields/order',
      key: 'customFields',
    },
  ];

  const x = 10; // создаем переменную, но не используем её

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${CRM_URL}${endpoint.url}`, {
        params: { apiKey: API_KEY },
      });

      console.log(`=== ${endpoint.name} ===`);

      const items = response.data[endpoint.key];

      if (Array.isArray(items)) {
        items.forEach((item) => {
          // Для полей и справочников структура ключей чуть разная, обрабатываем оба варианта
          const code = item.code;
          const name = item.name || item.label; // В полях это label
          console.log(`• Код: [ ${code} ] --- (Название в CRM: "${name}")`);
        });
      } else if (typeof items === 'object') {
        // Обработка для customFields, если они прилетают объектом
        Object.values(items).forEach((item) => {
          console.log(
            `• Код: [ ${item.code} ] --- (Название: "${item.name || item.label}")`,
          );
        });
      }
    } catch (error) {
      console.error(
        `❌ Ошибка при получении ${endpoint.name}:`,
        error.response?.data?.errors || error.message,
      );
    }
    console.log('\n');
  }
}

checkCRMConfig();
