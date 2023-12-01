import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';
import { logger } from './core/logger.js';

const mqttClient = new MqttClient({
  productId: 'T1ZKJHGDDO',
  deviceName: 'dev1',
  devicePsk: 't2s8/qtP0cJGlt8PmfYK4w==',
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
    case '_sys_gw_scan_subdev':
      // 处理开启扫描
      break;
    default:
      await delay(500);
      mqttClient.publishAction(getDefaultActionReply(payload));
  }
}


