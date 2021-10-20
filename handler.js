'use strict';

const {v4: uuidv4} = require('uuid');
const {SQSClient, SendMessageCommand} = require("@aws-sdk/client-sqs");
const {saveCompletedOrder, deliverOrder} = require('orderMetadataManager')

let sqs = new SQSClient({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = async (event, context, callback) => {

    const {name, address, pizzas} = JSON.parse(event.body);
    const order = {
        orderId: uuidv4(),
        name,
        address,
        pizzas
    }
    const params = {
        MessageBody: JSON.stringify(order),
        QueueUrl: QUEUE_URL
    };

    try {

        const data = await sqs.send(new SendMessageCommand(params));
        const message = {
            order,
            messageId: data.MessageId
        };
        sendResponse(200, message, callback);

    } catch (err) {

        sendResponse(500, err, callback);

    }

};

module.exports.prepararPedido = async (event, context, callback) => {

    console.log('preparar Pedido fue llamada');

    const order = JSON.parse(event.Records[0].body);

    try {
        const data = await saveCompletedOrder(order);
        console.log(data);
        callback();
    } catch (err) {
        console.error(err);
        callback(err);
    }

};

module.exports.enviarPedido = async (event, context, callback) => {
    console.log('enviarPedido fue llamada');

    const record = event.Records[0];
    if (record.eventName === 'INSERT') {
        console.log('deliverOrder');

        const orderId = record.dynamodb.Keys.orderId;

        try {
            const data = await deliverOrder(orderId);
            console.log(data);
            callback();
        } catch (err) {
            console.error(err);
            callback(err);
        }

    } else {
        console.log('is not a new record');
        callback();
    }
};

const sendResponse = (statusCode, message, callback) => {

    const response = {
        statusCode,
        body: JSON.stringify(message)
    };

    callback(null, response);

};
