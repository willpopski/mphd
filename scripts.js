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

  function renderImages() {
    const imageContainer = document.getElementById('imageContainer');
    // Clear existing images
    imageContainer.innerHTML = '';

    // Update the persistent filter message
    const filterMessage = document.getElementById('filterMessage');
    if (filteredAuthor) {
      filterMessage.style.display = 'block';
      filterMessage.innerHTML = `Filtered to ${filteredAuthor}'s images <a id="clearFilter">(clear filter)</a>`;

      // Add event listener to clear filter link
      document.getElementById('clearFilter').addEventListener('click', () => {
        filteredAuthor = null;
        renderImages();
        filterMessage.style.display = 'none';

        // Hide the reset filter button if no hidden authors
        if (hiddenAuthors.size === 0) {
          document.getElementById('resetFilterButton').style.display = 'none';
        }

        // Show toast message
        showToast('Filter has been cleared.');

        // PostHog event tracking for reset filter
        posthog.capture('Filter Cleared');
      });
    } else {
      filterMessage.style.display = 'none';
    }

    // Filter images if an author is selected or hidden
    let imagesToDisplay = allImageData.filter(data => !hiddenAuthors.has(data.author));

    if (filteredAuthor) {
      imagesToDisplay = imagesToDisplay.filter(data => data.author === filteredAuthor);
    }

    // Update the Shuffle Images button text with the count
    const shuffleButton = document.getElementById('shuffleButton');
    shuffleButton.textContent = `Shuffle ${imagesToDisplay.length} Images`;

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
  
      // Title text
      const labelText = document.createElement('p');
      labelText.textContent = `${title} by ${author}`;
  
      // Buttons container (centered)
      const buttonsContainer = document.createElement('div');
      buttonsContainer.classList.add('buttons-container');
  
      // Filter button
      const filterButton = document.createElement('a');
      filterButton.classList.add('icon-button');
      filterButton.href = '#';
      filterButton.textContent = `🔍 Only ${author}`;
  
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

    // Append buttons to buttons container
    if (filteredAuthor === author) {
      filterButton.style.display = 'none'; // Hide filter button if already filtered
      hideButton.style.display = 'none'; // Hide hide button if already filtered
    }
    buttonsContainer.appendChild(filterButton);
    buttonsContainer.appendChild(hideButton);

    // Append labelText and buttonsContainer to label
    label.appendChild(labelText);
    label.appendChild(buttonsContainer);

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
