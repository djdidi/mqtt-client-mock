import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';
import shortid from 'shortid';

const mqttClient = new MqttClient({
  productId: 'KVNMC2XYY2',
  deviceName: 'gwdjdev',
  devicePsk: 'q85f52JgKzvvsr6F7891XQ==',
  onPropertyDown,
  onActionDown,
});

async function onPropertyDown(payload) {
  await delay(500);
  mqttClient.publishProperty(getDefaultPropertyReport(payload));
}

async function onActionDown(payload) {
  const { actionId, params } = payload;

  switch (actionId) {
    case '_sys_gw_scan_subdev': {
      mqttClient.publishAction(getDefaultActionReply(payload));
      setTimeout(() => {
        const subDeviceUUIDs1 = [
          // 'AToBQzg3OFdBVExKMxFFEw==',
          // 'AToBQzg3OFdBVExKMxFFmQ==',
          // 'AToBQzg3OFdBVExKM2ZmAQ==',
          // 'AToBQzg3OFdBVExKM2ZmAg==',
          //
          // 'AToBQzg3OFdBVExKM2ZmAw==',
          // 'AToBQzg3OFdBVExKM2ZmBA==',
          // 'AToBQzg3OFdBVExKM2ZmBQ==',

          // 'AToBQzg3OFdBVExKM2ZmBg==',
          // 'AToBQzg3OFdBVExKM2ZmBw==',
          // 'AToBQzg3OFdBVExKM2ZmCA==',
          // 'AToBQzg3OFdBVExKM2ZmCQ==',
          //
          // 'AToBQzg3OFdBVExKM2ZmEA==',
          // 'AToBQzg3OFdBVExKM2ZmEQ==',
          // 'AToBQzg3OFdBVExKM2ZmEg==',
          // 'AToBQzg3OFdBVExKM2ZmEw==',
          //
          // 'AToBQzg3OFdBVExKM4iIAw==',
        ];
        mqttClient.publishAction({
          method: 'report',
          clientToken: shortid.generate(),
          params: {
            _sys_gw_scan_report: JSON.stringify([
              {
                protocol: 0, // BLE MESH
                product_id: 'HJOCZ26HD1',
                uuids: subDeviceUUIDs1.join(';'), // 多个子设备用 ; 隔开
              },
              {
                protocol: 0, // BLE MESH
                product_id: '7903P40RQD',
                uuids: 'AToBQzg3OFdBVExKM4iIAQ==;AToBQzg3OFdBVExKM4iIAg==;AToBQzg3OFdBVExKM4iIAw==;AToBQzg3OFdBVExKMxFFEw==;AToBQzg3OFdBVExKMxFFmQ==;AToBQzg3OFdBVExKM2ZmAQ==;AToBQzg3OFdBVExKM2ZmAg==;',
                // uuids: 'AToBQzg3OFdBVExKM4iIAQ==;',
              },
            ]),
          },
        })
      }, 3000);
      // 处理开启扫描
      break;
    }
    default:
      await delay(500);
      mqttClient.publishAction(getDefaultActionReply(payload));
  }
}


