// ./scripts.js

document.addEventListener('DOMContentLoaded', () => {
  let imageUrls = [];

  // Function to shuffle the array (same as before)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(window.crypto.getRandomValues(new Uint32Array(1))[0] / (2 ** 32) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to parse author and title from the URL (same as before)
  function parseAuthorAndTitle(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Example pathParts: ['', 'content', 'a~anaispays_9e40274a', 'life~in~a~pot.png']
      const authorPart = pathParts[2]; // 'a~anaispays_9e40274a'
      const titlePart = pathParts[3]; // 'life~in~a~pot.png'

      // Extract author
      const authorMatch = authorPart.match(/^a~([^_]+)/);
      let author = 'Unknown';
      if (authorMatch) {
        author = authorMatch[1];
      }

      // Extract title
      let title = titlePart.replace(/\.(png|jpg|jpeg)$/, ''); // Remove file extension
      title = title.replace(/~/g, ' '); // Replace '~' with spaces

      // Decode any URL-encoded characters
      author = decodeURIComponent(author);
      title = decodeURIComponent(title);

      // Capitalize first letters
      author = author.replace(/\b\w/g, char => char.toUpperCase());
      title = title.replace(/\b\w/g, char => char.toUpperCase());

      return { author, title };
    } catch (error) {
      console.error('Error parsing author and title from URL:', url, error);
      return { author: 'Unknown', title: 'Unknown' };
    }
  }

  // Function to render images
  function renderImages() {
    const imageContainer = document.getElementById('imageContainer');
    // Clear existing images
    imageContainer.innerHTML = '';

    imageUrls.forEach(url => {
      const { author, title } = parseAuthorAndTitle(url);

      // Create image element
      const img = document.createElement('img');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('src', url);
      img.alt = `${title} by ${author}`;

      // Create link around the image
      const link = document.createElement('a');
      link.href = url;
      link.appendChild(img);

      // Create label
      const label = document.createElement('div');
      label.classList.add('image-label');
      const labelText = document.createElement('p');
      labelText.textContent = `${title} by ${author}`;
      label.appendChild(labelText);

      // Wrap image and label
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('image-wrapper');
      imageWrapper.appendChild(link);
      imageWrapper.appendChild(label);

      // Append to container
      imageContainer.appendChild(imageWrapper);
    });
  }

  // Fetch images.json and initialize (same as before)
  fetch('images.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(urls => {
      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error('images.json is not a valid array or is empty.');
      }
      imageUrls = urls;
      shuffleArray(imageUrls);
      renderImages();
    })
    .catch(error => {
      console.error('Error loading images:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load images. Please try again later. ' + error.message;
      errorMessage.style.color = 'red';
      document.body.appendChild(errorMessage);
    });

  // Add event listener to the Shuffle Images button (same as before)
  const shuffleButton = document.getElementById('shuffleButton');
  shuffleButton.addEventListener('click', () => {
    shuffleArray(imageUrls);
    renderImages();
  });
});
