import mqtt from 'mqtt';
import { noop, randomString } from './utils.js';
import CryptoJS from 'crypto-js';
import { logger } from './logger.js';

export class MqttClient {
  productId;
  deviceName;
  devicePsk;
  brokerUrl;

  // topics
  upPropertyTopic;
  downPropertyTopic;
  upEventTopic;
  downEventTopic;
  upActionTopic;
  downActionTopic;
  upGatewayOptionTopic;
  downGatewayOptionResultTopic;
  // topic - ota
  upOtaTopic;
  downOtaTopic;

  mqttClient;

  // callback
  onMessage;
  onActionDown;
  onPropertyDown;
  onEventDown;
  onGatewayOption;
  onGatewayOptionResult;

  constructor({
    productId,
    deviceName,
    devicePsk,
    onMessage = noop,
    onActionDown = noop,
    onPropertyDown = noop,
    onEventDown = noop,
    onGatewayOption = noop,
    onGatewayOptionResult = noop,
  }) {
    this.productId = productId;
    this.deviceName = deviceName;
    this.devicePsk = devicePsk;
    this.brokerUrl = `mqtt://${productId}.iotcloud.tencentdevices.com`;

    this.upPropertyTopic = `$thing/up/property/${productId}/${deviceName}`;
    this.downPropertyTopic = `$thing/down/property/${productId}/${deviceName}`;
    this.upEventTopic = `$thing/up/event/${productId}/${deviceName}`;
    this.downEventTopic = `$thing/down/event/${productId}/${deviceName}`;
    this.upActionTopic = `$thing/up/action/${productId}/${deviceName}`;
    this.downActionTopic = `$thing/down/action/${productId}/${deviceName}`;

    this.downGatewayOptionResultTopic = `$gateway/operation/result/${productId}/${deviceName}`;

    this.upOtaTopic = `$ota/report/${productId}/${deviceName}`;
    this.downOtaTopic = `$ota/update/${productId}/${deviceName}`;

    this.connect();

    this.onMessage = onMessage;
    this.onActionDown = onActionDown;
    this.onPropertyDown = onPropertyDown;
    this.onEventDown = onEventDown;
  }

  getTopicDescription(topic = '') {
    let desc = '';

    const publishTopicPrefix = [
      '$thing/up',
      '$ota/report',
      '$gateway/operation',
    ];
    const subscribeTopicPrefix = [
      '$thing/down',
      '$ota/update',
      '$gateway/operation/result',
    ];

    if (publishTopicPrefix.find(prefix => topic.startsWith(prefix))) {
      desc += '上行:';
    } else if (subscribeTopicPrefix.find(prefix => topic.startsWith(prefix))) {
      desc += '下行:';
    } else {
      desc += '未知Topic';
    }

    if (topic.includes('property')) {
      desc += '属性';
    } else if (topic.includes('event')) {
      desc += '事件';
    } else if (topic.includes('action')) {
      desc += '行为';
    } else if (topic.includes('gateway')) {
      desc += '网关';
    } else if (topic.includes('ota')) {
      desc += 'OTA';
    }

    return desc;
  }

  connect() {
    const sdkAppId = 12010126;
    const connId = randomString(5);
    const clientId = `${this.productId}${this.deviceName}`;
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const username = `${this.productId}${this.deviceName};${sdkAppId};${connId};${expiry}`;
    const password = `${CryptoJS.HmacSHA256(username, CryptoJS.enc.Base64.parse(this.devicePsk))};hmacsha256`;

    logger.info({
      username,
      password,
      brokerUrl: this.brokerUrl
    }, '链接参数');

    this.mqttClient = mqtt.connect(this.brokerUrl, {
      clientId,
      username,
      password,
      reconnectPeriod: 0,
    });

    this.mqttClient.on('connect', () => this.onConnect());
    this.mqttClient.on('error', (err) => this.onError(err));
    this.mqttClient.on('message', (...args) => this._onMessage(...args));
  }

  onConnect() {
    logger.info(`Connect ${this.brokerUrl}`);

    const subscribeTopicList = [
      this.downPropertyTopic,
      this.downActionTopic,
      this.downEventTopic,
      this.downGatewayOptionResultTopic,
      this.downOtaTopic,
    ];

    subscribeTopicList.forEach((topic) => {
      this.mqttClient.subscribe(topic, (err, granted) => {
        if (err) {
          logger.error(err, topic);
        }
        logger.info(`Subscribe Topic: ${topic}`);
      });
    });
  }

  onError(err) {
    logger.error(err, 'MqttClient Error');
  }

  _onMessage(topic, payload, packet) {
    try {
      payload = JSON.parse(payload.toString());
    } catch (err) {
      logger.error(err, '格式化payload错误');
      return;
    }

    logger.info(payload, `${this.getTopicDescription(topic)} ${topic} ${payload?.method}`);

    switch (topic) {
      case this.downPropertyTopic: {
        if (payload.method === 'control') {
          this.onPropertyDown(payload);
        }
        break;
      }
      case this.downActionTopic: {
        this.onActionDown(payload);
        break;
      }
      default: {
        this.onMessage(payload);
      }
    }

    this.onMessage(topic, payload, packet);
  }

  publish({ topic, message }) {
    if (typeof message !== 'string') {
      try {
        message = JSON.stringify(message);
      } catch (err) {
        logger.error(err, '格式化错误 publish message');
        return;
      }
    }
    this.mqttClient.publish(topic, message, {}, () => {
      message = JSON.parse(message);
      logger.info(message, `️${this.getTopicDescription(topic)} ${message?.method} ${topic}`);
    });
  }

  publishProperty(message) {
    this.publish({
      topic: this.upPropertyTopic,
      message,
    });
  }

  publishAction(message) {
    this.publish({
      topic: this.upActionTopic,
      message,
    });
  }
}

