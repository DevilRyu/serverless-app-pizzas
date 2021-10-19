'use strict';

const {v4: uuidv4} = require('uuid');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

let sqs = new SQSClient({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = async (event, context, callback) => {

    const orderId = uuidv4();
    const params = {
        MessageBody: JSON.stringify({orderId}),
        QueueUrl: QUEUE_URL
    };

    try {

        const data = await sqs.send(new SendMessageCommand(params));
        const message = {
            orderId,
            messageId: data.MessageId
        };
        sendResponse(200, message, callback);

    } catch (err) {

        sendResponse(500, err, callback);

    }

};

module.exports.prepararPedido = async (event, context, callback) => {

    console.log('prepararPedido fue llamada');

    callback();

};

const sendResponse = (statusCode, message, callback) => {

    const response = {
        statusCode,
        body: JSON.stringify(message)
    };

    callback(null, response);

};
