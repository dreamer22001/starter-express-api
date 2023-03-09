const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
var CryptoJS = require("crypto-js");

module.exports = app => {
  const controller = {};

  const tokenList = [];

  const TokenStatus = {
    WAIT: 0,
    EXPIRED: -1,
    APPROVED: 1
  }

  function generateToken(userId) {
    //edit the token allowed characters
    const length = 20;
    const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    const b = [];
    for (let i = 0; i < length; i++) {
      const j = (Math.random() * (a.length - 1)).toFixed(0);
      b[i] = a[j];
    }
    const stringConcat = b.join("") + userId;
    return CryptoJS.MD5(stringConcat);
  }

  function storeToken(token, qrcode) {
    return tokenList.push({
      id: uuidv4(),
      token,
      status: TokenStatus.WAIT,
      qrcode: qrcode,
      timestamp: new Date().toISOString()
    })
  }

  function updateStatusToken(token) {
    console.log('entrou')
    let status = false;
    tokenList.forEach((tokenObj) => {
      console.log('tokenObj.token = ' + tokenObj.token);
      console.log('token = ' + token);
      if (tokenObj.status === TokenStatus.WAIT && tokenObj.token === token.toString()) {
        tokenObj.status = TokenStatus.APPROVED;
        status = true;
      }
    });
    return status;
  }

  controller.getQRCode = (req, res) => {
    const response = {
      qrCode: null,
      id: null,
      error: false,
    }
    let token = generateToken(req.params.userId);
    QRCode.toDataURL(token.toString(), function (err, url) {
      if (err) {
        response.error = true;
        return;
      }
      const indice = storeToken(token.toString(), url);
      response.qrCode = url;
      response.id = tokenList[indice - 1].id;
      console.log(tokenList);
      res.status(200).json(response);
    })
  };

  controller.getTokenList = (req, res) => res.status(200).json(tokenList);

  controller.isApprovedQRCode = (req, res) => {
    let status = false;
    tokenList.forEach((tokenObj) => {
      if (tokenObj.status === TokenStatus.APPROVED && tokenObj.id === req.params.id.toString()) {
        status = true;
      }
    });

    res.status(200).json({
      isApprovedQRCode: status
    });
  };

  controller.validateQRCode = (req, res) => {
    console.log(tokenList);
    const token = req.body.token;
    const success = updateStatusToken(token);
    console.log('Status: ' + success);
    if (success) {
      res.status(201).json({
        "text": "Token approved",
        "approved": true
      });
      return;
    }
    res.status(500).json({
      "text": "Token error",
      "approved": false
    });
  }

  return controller;
}