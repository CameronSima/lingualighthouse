const utils = require("@architect/utils");

module.exports = {
  deploy: {
    start: async ({ cloudformation, inventory }) => {
      if (!inventory.inv.queues) return cloudformation;

      const queues = inventory.inv.queues.filter(
        (queue) => queue.config.batchSize
      );

      for (const queue of queues) {
        console.log({ queue });
        const batchSize = queue.config.batchSize;
        const logicalId = utils.toLogicalID(queue.name);
        const resourceName = `${logicalId}QueueLambda`;
        const eventName = `${logicalId}QueueEvent`;

        cloudformation.Resources[resourceName].Properties.Events[
          eventName
        ].Properties.BatchSize = batchSize;
      }

      return cloudformation;
    },
  },
};
