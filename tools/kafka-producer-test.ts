/* eslint-disable no-console */
import { Kafka, CompressionTypes } from 'kafkajs';
import { config } from 'dotenv';

config();

const kafka = new Kafka({
  clientId: 'test-producer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: process.env.KAFKA_SSL_ENABLED === 'true',
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  idempotent: true,
});

async function sendTestMessages(): Promise<void> {
  try {
    await producer.connect();
    console.log('Productor conectado a Kafka');

    const orderCreatedEvent = {
      orderId: `ORD-${Date.now()}`,
      userId: 123,
      clientId: 1,
      items: [
        { productId: 'prod-1', quantity: 2, price: 29.99 },
        { productId: 'prod-2', quantity: 1, price: 49.99 },
      ],
      totalAmount: 109.97,
      timestamp: new Date().toISOString(),
    };

    const result = await producer.send({
      topic:
        process.env.KAFKA_TOPIC_ORDER_CREATED || 'ecommerce.orders.created',
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: orderCreatedEvent.orderId,
          value: JSON.stringify(orderCreatedEvent),
          headers: {
            source: Buffer.from('test-producer'),
            timestamp: Buffer.from(Date.now().toString()),
          },
        },
      ],
    });

    console.log('Mensaje enviado con éxito:', JSON.stringify(result, null, 2));

    const productUpdatedEvent = {
      productId: 'prod-1',
      clientId: 1,
      categoryId: 'electronics',
      product: {
        id: 'prod-1',
        name: 'Smartphone actualizado',
        description: 'Smartphone de última generación',
        price: 599.99,
        stock: 50,
        categoryId: 'electronics',
      },
    };

    const result2 = await producer.send({
      topic:
        process.env.KAFKA_TOPIC_PRODUCT_UPDATED || 'ecommerce.products.updated',
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: productUpdatedEvent.productId,
          value: JSON.stringify(productUpdatedEvent),
        },
      ],
    });

    console.log(
      'Mensaje de producto actualizado enviado con éxito:',
      JSON.stringify(result2, null, 2),
    );
  } catch (error) {
    console.error('Error al enviar mensajes:', error);
  } finally {
    await producer.disconnect();
    console.log('Productor desconectado');
  }
}

sendTestMessages()
  .then(() => console.log('Proceso completado'))
  .catch((err) => console.error('Error general:', err))
  .finally(() => process.exit(0));
