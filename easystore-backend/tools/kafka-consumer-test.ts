/* eslint-disable no-console */
import { Kafka } from 'kafkajs';
import { config } from 'dotenv';

config();

const kafka = new Kafka({
  clientId: 'test-consumer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: process.env.KAFKA_SSL_ENABLED === 'true',
});

const consumer = kafka.consumer({
  groupId: 'test-consumer-group',
  allowAutoTopicCreation: true,
});

async function consumeMessages(): Promise<void> {
  try {
    await consumer.connect();
    console.log('Consumidor conectado a Kafka');

    const ordersTopic =
      process.env.KAFKA_TOPIC_ORDER_CREATED || 'ecommerce.orders.created';
    const productsTopic =
      process.env.KAFKA_TOPIC_PRODUCT_UPDATED || 'ecommerce.products.updated';

    await consumer.subscribe({ topic: ordersTopic, fromBeginning: true });
    console.log(`Suscrito al tópico: ${ordersTopic}`);

    await consumer.subscribe({ topic: productsTopic, fromBeginning: true });
    console.log(`Suscrito al tópico: ${productsTopic}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key?.toString();
        const value = message.value?.toString();
        const headers = Object.entries(message.headers || {}).reduce(
          (acc, [key, value]) => {
            acc[key] = value?.toString();
            return acc;
          },
          {},
        );

        console.log(`\n========== MENSAJE RECIBIDO ==========`);
        console.log(`Tópico: ${topic}`);
        console.log(`Partición: ${partition}`);
        console.log(`Offset: ${message.offset}`);
        console.log(`Clave: ${key}`);
        console.log(`Cabeceras: ${JSON.stringify(headers, null, 2)}`);
        console.log(
          `Timestamp: ${new Date(Number(message.timestamp)).toISOString()}`,
        );

        try {
          const parsedValue = JSON.parse(value || '{}') as Record<
            string,
            unknown
          >;
          console.log('Valor (JSON):');
          console.log(JSON.stringify(parsedValue, null, 2));
        } catch (_error) {
          console.log(`Valor: ${value}`);
        }

        console.log(`======================================\n`);

        // Si es una orden, simular procesamiento
        if (topic === ordersTopic) {
          console.log('Procesando orden...');
          // Simular algún procesamiento
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log('Orden procesada con éxito');
        }

        // Si es una actualización de producto, simular actualización de caché
        if (topic === productsTopic) {
          console.log('Actualizando caché de productos...');
          // Simular algún procesamiento
          await new Promise((resolve) => setTimeout(resolve, 300));
          console.log('Caché de productos actualizada');
        }
      },
    });

    // Mantener el script ejecutándose
    console.log(
      'Consumidor está escuchando mensajes. Presiona Ctrl+C para salir.',
    );
  } catch (error) {
    console.error('Error al consumir mensajes:', error);
  }

  // Configurar manejador para cierre limpio
  const errorTypes = ['unhandledRejection', 'uncaughtException'];
  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  errorTypes.forEach((type) => {
    process.on(type, (e) => {
      try {
        console.log(`Ocurrió un error de tipo ${type}: ${e}`);
        consumer.disconnect().catch(() => {});
        process.exit(0);
      } catch (_) {
        process.exit(1);
      }
    });
  });

  signalTraps.forEach((type) => {
    process.once(type, () => {
      try {
        consumer.disconnect().catch(() => {});
        console.log('Consumidor desconectado limpiamente');
      } finally {
        process.exit(0);
      }
    });
  });
}

// Ejecutar la función principal
consumeMessages()
  .then(() => console.log('Consumidor iniciado'))
  .catch((err) => console.error('Error general:', err));
