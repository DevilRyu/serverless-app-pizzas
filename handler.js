'use strict';

const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');

let sqs = new AWS.SQS({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = async (event, context, callback) => {

    console.log('HacerPedido fue llamada');
    const orderId = uuidv4();

    const params = {
        MessageBody: JSON.stringify({orderId}),
        QueueUrl: QUEUE_URL
    };

    sqs.sendMessage(params, function (err, data){

        if(err) {
            sendResponse(500, err, callback);
        }else {

            const message = {
                orderId,
                messageId: data.MessageId
            };

            sendResponse(200, message, callback);
        }

    });



};

const sendResponse = (statusCode, message, callback) => {

    const response = {
        statusCode,
        body: JSON.stringify(message)
    };

    callback(null, response);

};
