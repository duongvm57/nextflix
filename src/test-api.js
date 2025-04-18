// Test script for API calls

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

async function testCategoryAPI() {
  console.log('Testing category API...');
  const response = await fetchAPI('https://phimapi.com/the-loai');
  console.log('Categories:', response.slice(0, 3)); // Show first 3 categories
}

async function testMovieTypeAPI() {
  console.log('\nTesting movie type API...');
  const response = await fetchAPI('https://phimapi.com/v1/api/danh-sach/phim-bo?page=1');
  console.log('Status:', response.status);
  console.log('First movie:', response.data.items[0].name);
  console.log('Total items:', response.data.params.pagination.totalItems);
}

async function testLanguageFilterAPI() {
  console.log('\nTesting language filter API...');
  const response = await fetchAPI(
    'https://phimapi.com/v1/api/danh-sach/phim-bo?page=1&sort_lang=long-tieng'
  );
  console.log('Status:', response.status);
  console.log('First movie:', response.data.items[0].name);
  console.log('Language:', response.data.items[0].lang);
  console.log('Total items:', response.data.params.pagination.totalItems);
}

async function runTests() {
  try {
    await testCategoryAPI();
    await testMovieTypeAPI();
    await testLanguageFilterAPI();
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
