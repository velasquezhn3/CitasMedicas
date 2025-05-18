import { Queue } from 'bullmq';

const appointmentQueue = new Queue('appointments', {
  connection: {
    host: 'redis',
  },
});

export default appointmentQueue;
