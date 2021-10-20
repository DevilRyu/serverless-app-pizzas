const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb");

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

    console.log('Guardar un pedido fue llamado');

    order.delivery_status = 'READY_FOR_DELIVERY';

    const params = {
        TableName: process.env.COMPLETED_ORDER_TABLE,
        Item: formatoDynamo(order)
    };

    return ddbClient.send(new PutItemCommand(params));

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

