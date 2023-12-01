export function getDefaultPropertyReport(payload) {
  return {
    // method: 'control_reply',
    method: 'report',
    clientToken: payload.clientToken || 'default_client_token',
    params: payload.params,
  };
}

export function getDefaultActionReply(payload) {
  return {
    method: 'action_reply',
    clientToken: payload.clientToken,
    code: 0,
    status: 'success_mock',
    response: {
      code: 1,
    }
  }
}
