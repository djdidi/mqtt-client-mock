import { MqttClient } from './core/MqttClient.js';
import { delay } from './core/utils.js';
import { getDefaultActionReply, getDefaultPropertyReport } from './core/helper.js';
import { logger } from './core/logger.js';
import shortid from 'shortid';

const mqttClient = new MqttClient({
  productId: 'P3GGAPDGBT',
  deviceName: 'gw01',
  devicePsk: 'TqJrvhPLkRoVFfspj7PXrQ==',
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
    case '_sys_gw_scan_subdev': {
      mqttClient.publishAction(getDefaultActionReply(payload));
      if (params.scan === 0) {
        return;
      }
      setTimeout(() => {
        const subDeviceUUIDs1 = [
          'AToBQzg3OFdBVExKMxFFEw==',
          'AToBQzg3OFdBVExKMxFFmQ==',
          'AToBQzg3OFdBVExKM2ZmAQ==',
          'AToBQzg3OFdBVExKM2ZmAg==',

          'AToBQzg3OFdBVExKM2ZmAw==',
          'AToBQzg3OFdBVExKM2ZmBA==',
          'AToBQzg3OFdBVExKM2ZmBQ==',

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
        mqttClient.publishProperty({
          method: 'report',
          clientToken: shortid.generate(),
          params: {
            _sys_gw_scan_report: JSON.stringify([
              // {
              //   protocol: 0, // BLE MESH
              //   product_id: 'HJOCZ26HD1',
              //   uuids: subDeviceUUIDs1.join(';'), // 多个子设备用 ; 隔开
              // },
              {
                protocol: 0, // BLE MESH
                product_id: 'X5V9NNK3D9',
                uuids: 'AToBQzg3OFdBVExKMxFFEw==;AToBQzg3OFdBVExKMxFFEw==;AToBQzg3OFdBVExKM6oBEQ==',
                // uuids: 'AToBQzg3OFdBVExKM4iIAQ==;AToBQzg3OFdBVExKM4iIAg==;AToBQzg3OFdBVExKM4iIAw==;AToBQzg3OFdBVExKMxFFEw==;AToBQzg3OFdBVExKMxFFmQ==;AToBQzg3OFdBVExKM2ZmAQ==;AToBQzg3OFdBVExKM2ZmAg==;',
                // uuids: 'AToBQzg3OFdBVExKM4iIAg==;',
              },
              {
                protocol: 1, // PLC
                product_id: 'QW06SGBHDV',
                uuids: 'SFkBQ1JJRERCRVRNV0xaAA6LoA==',
                // uuids: 'AToBQzg3OFdBVExKM4iIAQ==;AToBQzg3OFdBVExKM4iIAg==;AToBQzg3OFdBVExKM4iIAw==;AToBQzg3OFdBVExKMxFFEw==;AToBQzg3OFdBVExKMxFFmQ==;AToBQzg3OFdBVExKM2ZmAQ==;AToBQzg3OFdBVExKM2ZmAg==;',
                // uuids: 'AToBQzg3OFdBVExKM4iIAg==;',
              },
            ]),
          },
        })
      }, 3000);
      break;
    }
    default:
      await delay(500);
      mqttClient.publishAction(getDefaultActionReply(payload));
  }
}
