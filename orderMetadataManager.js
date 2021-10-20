const {DynamoDBClient, PutItemCommand, UpdateItemCommand} = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient({region: process.env.REGION});

/*
 order : {
  orderId: String,
  name: String,
  address: String,
  pizzas: Array of Strings,
  delivery_status: READY_FOR_DELIVERY / DELIVERED
  timestamp: timestamp
}
*/

module.exports.saveCompletedOrder = order => {

    console.log('Guardar un pedido fue llamada');

    order.delivery_status = 'READY_FOR_DELIVERY';

    const params = {
        TableName: process.env.COMPLETED_ORDER_TABLE,
        Item: formatoDynamo(order)
    };

    return ddbClient.send(new PutItemCommand(params));

};

module.exports.deliverOrder = orderId => {
    console.log('Enviar una orden fue llamada');

    const params = {
        TableName: process.env.COMPLETED_ORDER_TABLE,
        Key: {
            orderId
        },
        ConditionExpression: 'attribute_exists(orderId)',
        UpdateExpression: 'SET delivery_status = :v',
        ExpressionAttributeValues: {
            ':v': {S: 'DELIVERED'}
        },
        ReturnValues: 'ALL_NEW'
    };


    return ddbClient.send(new UpdateItemCommand(params)).then(response => {
        console.log('order delivered');
        return response.Attributes;
    });

};

const formatoDynamo = (order) => {

    let pizzas = [];

    for (const pizza of order.pizzas) {
        pizzas.push({S: pizza});
    }

    return {
        orderId: {S: order.orderId},
        name: {S: order.name},
        address: {S: order.address},
        pizzas: {L: pizzas},
        delivery_status: {S: order.delivery_status}
    }

}

