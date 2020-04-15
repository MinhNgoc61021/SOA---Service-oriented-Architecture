const { Connection } = require('amqplib-as-promised');

const getMovieByIndex = (index) => {
  index += 137523;
  return `https://www.imdb.com/title/tt0${index}`;
}

async function sender() {
  // Connect to the RabbitMQ server
  const connection = new Connection('amqp://localhost');
  await connection.init();
  // createConfirmChannel
  const channel = await connection.createChannel(); 
  
  // Create queue
  var queue = 'filmQueue';
  await channel.assertQueue(queue, {durable: true}); 
  // Durability makes sure that even if RabbitMQ restarts, the queue wiil stay alive.
  
  for (var i = 0; i < 150; i++)  {
    var url= getMovieByIndex(i);
    await channel.sendToQueue(queue, Buffer.from(url), { persistent: true });
    // Message persistence tells RabbitMQ to save the message to the disk
    // However not entirely since it will take a short time frame for RabbitMQ to confirm the message
    console.log('Sent: ' + url);
  }
  await channel.close();
  await connection.close();
  process.exit(0);
}

sender();