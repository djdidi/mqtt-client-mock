import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';

const mqttClient = new MqttClient({
  productId: '90XNPQHAAX',
  deviceName: 'dev1',
  devicePsk: 'nM8NlwD3Dec/7vdZ2wIoZQ==',
  onPropertyDown,
  onActionDown,
});

async function onPropertyDown(payload) {
  await delay(1000);
  mqttClient.publishProperty(getDefaultPropertyReport(payload));
}

async function onActionDown(payload) {
  const {
    actionId,
    params = {
      target_version: 'v0.0.1',
    },
  } = payload;

  switch (actionId) {
    case 'report_ota_version': {
      mqttClient.publish({
        topic: mqttClient.upOtaTopic,
        message: {
          type: 'report_version',
          report: {
            version: params.target_version,
          },
        },
      });
      mqttClient.publishAction(getDefaultActionReply(payload));
      break;
    }

    default:
      await delay(500);
      mqttClient.publishAction(getDefaultActionReply(payload));
  }
}
