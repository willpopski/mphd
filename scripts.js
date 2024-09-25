// ./scripts.js

document.addEventListener('DOMContentLoaded', () => {
  let imageUrls = [];
  let allImageData = []; // Store parsed data for each image
  let filteredAuthor = null; // Track the current author filter
  let hiddenAuthors = new Set(); // Track hidden authors

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

  // Function to show toast message
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3000);
  }

  // Function to render images
  function renderImages() {
    const imageContainer = document.getElementById('imageContainer');
    // Clear existing images
    imageContainer.innerHTML = '';

    // Filter images if an author is selected or hidden
    let imagesToDisplay = allImageData.filter(data => !hiddenAuthors.has(data.author));

    if (filteredAuthor) {
      imagesToDisplay = imagesToDisplay.filter(data => data.author === filteredAuthor);
    }

    if (imagesToDisplay.length === 0) {
      const noImagesMessage = document.createElement('p');
      noImagesMessage.textContent = 'No images to display.';
      noImagesMessage.style.color = '#EEE';
      imageContainer.appendChild(noImagesMessage);
      return;
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
      titleSpan.textContent = `${title} by`;

      const authorSpan = document.createElement('span');
      authorSpan.textContent = author;

      // Highlight the author's name if filtered
      if (filteredAuthor && author === filteredAuthor) {
        authorSpan.classList.add('highlight');
      }

      // Wrap author name and icons
      const authorContainer = document.createElement('span');
      authorContainer.classList.add('author-container');
      authorContainer.appendChild(authorSpan);

      // Filter button
      const filterButton = document.createElement('a');
      filterButton.classList.add('icon-button');
      filterButton.href = '#';
      filterButton.textContent = `🔍 Only show ${author}`;

      // Add event listener to the filter button
      filterButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent event bubbling
        filteredAuthor = author;
        renderImages();
        // Show the reset filter button
        document.getElementById('resetFilterButton').style.display = 'block';

        // Show toast message
        showToast(`Now showing only images by ${author}.`);

        // PostHog event tracking for author filter
        posthog.capture('Author Filtered', {
          author: author,
          title: title,
        });
      });

      // Hide button
      const hideButton = document.createElement('a');
      hideButton.classList.add('icon-button');
      hideButton.href = '#';
      hideButton.textContent = `🙈 Hide ${author}`;

      // Add event listener to the hide button
      hideButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        hiddenAuthors.add(author);
        renderImages();
        // Show the reset filter button
        document.getElementById('resetFilterButton').style.display = 'block';

        // Show toast message
        showToast(`Images by ${author} are now hidden.`);

        // PostHog event tracking for author hide
        posthog.capture('Author Hidden', {
          author: author,
          title: title,
        });
      });

      // Append buttons to author container
      if (filteredAuthor === author) {
        filterButton.style.display = 'none'; // Hide filter button if already filtered
        hideButton.style.display = 'none'; // Hide hide button if already filtered
      }
      authorContainer.appendChild(filterButton);
      authorContainer.appendChild(hideButton);

      // Append title and authorContainer to labelText
      labelText.appendChild(titleSpan);
      labelText.appendChild(authorContainer);

      // Append labelText to label
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

    // PostHog event tracking for shuffle
    posthog.capture('Images Shuffled');
  });

  // Add event listener to the Reset Filter button
  const resetFilterButton = document.getElementById('resetFilterButton');
  resetFilterButton.addEventListener('click', () => {
    filteredAuthor = null;
    hiddenAuthors.clear();
    renderImages();
    // Hide the reset filter button
    resetFilterButton.style.display = 'none';

    // Show toast message
    showToast('Filters have been reset.');

    // PostHog event tracking for reset filter
    posthog.capture('Filters Reset');
  });
});
