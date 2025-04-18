// Test script for Year API

async function fetchAPI(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

async function testYearAPI() {
  console.log('Testing year API...');
  const response = await fetchAPI(
    'https://phimapi.com/v1/api/nam/2024?page=1&sort_field=modified.time&sort_type=desc&limit=10'
  );
  console.log('Status:', response.status);
  if (response.data && response.data.items) {
    console.log('First movie:', response.data.items[0].name);
    console.log('Total items:', response.data.params.pagination.totalItems);
  } else {
    console.log('Response structure:', JSON.stringify(response, null, 2).substring(0, 500) + '...');
  }
}

async function runTests() {
  try {
    await testYearAPI();
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
