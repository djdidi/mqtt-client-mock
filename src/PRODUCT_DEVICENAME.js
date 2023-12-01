import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';
import { logger } from './core/logger.js';

const mqttClient = new MqttClient({
  productId: 'PRODUCTID',
  deviceName: 'DEVICENAME',
  devicePsk: 'PSKKKKK',
  onPropertyDown,
  onActionDown,
});

async function onPropertyDown (payload) {
  await delay(500);
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


