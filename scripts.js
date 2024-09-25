// ./scripts.js

document.addEventListener('DOMContentLoaded', () => {
  let imageUrls = [];
  let allImageData = []; // Store parsed data for each image
  let filteredAuthor = null; // Track the current author filter

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

    // Filter images if an author is selected
    let imagesToDisplay = allImageData;
    if (filteredAuthor) {
      imagesToDisplay = allImageData.filter(data => data.author === filteredAuthor);
    }

    imagesToDisplay.forEach(data => {
      const { url, author, title } = data;

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

      // Text content
      const labelText = document.createElement('p');

      // Create span elements for title and author
      const titleSpan = document.createElement('span');
      titleSpan.textContent = `${title} by `;

      const authorSpan = document.createElement('span');
      authorSpan.textContent = author;

      // Highlight the author's name if filtered
      if (filteredAuthor && author === filteredAuthor) {
        authorSpan.classList.add('highlight');
      }

      // Append title and author to labelText
      labelText.appendChild(titleSpan);
      labelText.appendChild(authorSpan);

      // Filter icon
      const filterIcon = document.createElement('span');
      filterIcon.classList.add('filter-icon');

      // Use a Unicode funnel symbol as the filter icon (or use an image if preferred)
      filterIcon.innerHTML = '🔍'; // You can replace this with an <img> tag for a custom icon

      // Add event listener to the filter icon
      filterIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event bubbling
        filteredAuthor = author;
        renderImages();
        // Show the reset filter button
        document.getElementById('resetFilterButton').style.display = 'block';
      });

      // Append text and icon to label
      label.appendChild(labelText);
      label.appendChild(filterIcon);

      // Wrap image and label
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('image-wrapper');
      imageWrapper.appendChild(link);
      imageWrapper.appendChild(label);

      // Append to container
      imageContainer.appendChild(imageWrapper);
    });
  }

  // Fetch images.json and initialize
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
      // Parse data and store it
      allImageData = imageUrls.map(url => {
        const { author, title } = parseAuthorAndTitle(url);
        return { url, author, title };
      });
      renderImages();
    })
    .catch(error => {
      console.error('Error loading images:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load images. Please try again later. ' + error.message;
      errorMessage.style.color = 'red';
      document.body.appendChild(errorMessage);
    });

  // Add event listener to the Shuffle Images button
  const shuffleButton = document.getElementById('shuffleButton');
  shuffleButton.addEventListener('click', () => {
    shuffleArray(allImageData);
    renderImages();
  });

  // Add event listener to the Reset Filter button
  const resetFilterButton = document.getElementById('resetFilterButton');
  resetFilterButton.addEventListener('click', () => {
    filteredAuthor = null;
    renderImages();
    // Hide the reset filter button
    resetFilterButton.style.display = 'none';
  });
});
