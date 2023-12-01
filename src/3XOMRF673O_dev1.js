import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';
import { logger } from './core/logger.js';

const mqttClient = new MqttClient({
  productId: '3XOMRF673O',
  deviceName: 'dev1',
  devicePsk: 'yZLSUbj3r0ndT+hloR4TwA==',
  onPropertyDown,
  onActionDown,
});

async function onPropertyDown (payload) {
  await delay(2000);
  mqttClient.publishProperty(getDefaultPropertyReport(payload));
}

async function onActionDown(payload) {
  const { actionId, params } = payload;

  switch (actionId) {
    default:
      await delay(500);
      mqttClient.publishAction(getDefaultActionReply(payload));
  }
}
