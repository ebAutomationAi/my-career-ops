console.log('starting');
const query = 'test';
const url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
(async () => {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9'
    }
  });
  console.log('status', res.status);
  const text = await res.text();
  console.log('first 2000 chars', text.slice(0, 2000).replace(/\n/g,' '));
})();
