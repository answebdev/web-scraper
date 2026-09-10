const feedDisplay = document.querySelector('#feed');

// Get data from the backend (index.js)
fetch('http://localhost:8000/results')
  .then((response) => response.json())
  // .then((data) => console.log(data));
  .then((data) => {
    const list = document.getElementById('article-list');
    const baseUrl = 'https://www.theguardian.com';
    list.innerHTML = '';

    data.forEach((article) => {
      let finalUrl = article.url;
      if (finalUrl && !finalUrl.startsWith('http')) {
        const cleanPath = finalUrl.startsWith('/')
          ? finalUrl.substring(1)
          : finalUrl;
        finalUrl = `${baseUrl}/${cleanPath}`;
      }

      // DEBUG: See what the scraper actually found
      console.log('Article Data:', article);

      const link = document.createElement('a');
      link.href = finalUrl;

      // Using the text from your scraper
      link.textContent = article.title || 'Untitled Article';

      link.target = '_blank';

      const listItem = document.createElement('li');
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
  })
  .catch((err) => console.log(err));
