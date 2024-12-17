const autocannon = require('autocannon');
const fs = require('fs');

// Define the Autocannon test configuration
const runTest = () => {
  const url = 'http://localhost:3000/api/nlp/v2/intent'; // Replace with your API endpoint

  const instance = autocannon(
    {
      url,
      method: 'POST',
      connections: 100, // Number of concurrent connections
      pipelining: 10,   // Number of requests to pipeline
      duration: 60,     // Duration in seconds
      requests: [
        {
          method: 'POST',
          path: '/api/nlp/v2/intent',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: 'Tôi muốn đặt 5 vé xem phim tại Hà Nội vào buổi tối ngày 25/12/2024 lúc 20:00.'
          })
        },
        {
          method: 'POST',
          path: '/api/nlp/v2/intent',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: 'Tôi muốn mua laptop giá 1500.'
          })
        }
      ]
    },
    (err, result) => {
      if (err) {
        console.error('Load test failed:', err);
      } else {
        console.log('Load test completed.');
        console.log(result);
        saveResult(result);
      }
    }
  );

  autocannon.track(instance);

  instance.on('tick', () => {
    console.log('Progress...');
  });

  instance.on('done', () => {
    console.log('Test finished.');
  });
};

// Save results to a file
const saveResult = (result) => {
  fs.writeFileSync('./test/output/autocannon-result.json', JSON.stringify(result, null, 2));
  console.log('Result saved to autocannon-result.json');
};

// Run the test
runTest();
