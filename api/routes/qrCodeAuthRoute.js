module.exports = app => {
  const controller = app.controllers.qrCodeAuth;

  app.route('/api/v1/getQRCode/:userId')
    .get(controller.getQRCode);

  app.route('/api/v1/getTokenList')
    .get(controller.getTokenList);
  
    app.route('/api/v1/isApprovedQRCode/:id')
    .get(controller.isApprovedQRCode);

  app.route('/api/v1/validateQRCode')
    .post(controller.validateQRCode);
}