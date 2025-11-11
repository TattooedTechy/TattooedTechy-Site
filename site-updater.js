/**
 * Fetches content from content.json and renders it into the #content-feed div.
 * @param {string|string[]} category - The category (or categories) to filter by. Use 'all' for no filter.
 * @param {number|null} limit - The maximum number of items to display. Use null for no limit.
 */
async function renderContent(category, limit) {
    const feed = document.getElementById('content-feed');
    if (!feed) {
        console.error('Error: #content-feed element not found on this page.');
        return;
    }

    // Show a loading state
    feed.innerHTML = `
        <div class="bg-gray-800/50 rounded-2xl shadow-lg p-6 md:col-span-2 lg:col-span-3 flex items-center justify-center space-x-4">
            <svg class="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-xl font-semibold text-gray-300">Loading content...</span>
        </div>`;

    try {
        const response = await fetch('content.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch content.json: ${response.statusText}`);
        }
        const allContent = await response.json();

        // 1. Sort by date (newest first)
        const sortedContent = allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 2. Filter by category
        let filteredContent;
        if (category === 'all') {
            filteredContent = sortedContent;
        } else if (Array.isArray(category)) {
            // Handle array of categories (e.g., ['recipe', 'review'])
            filteredContent = sortedContent.filter(item => category.includes(item.category));
        } else {
            // Handle single string category
            filteredContent = sortedContent.filter(item => item.category === category);
        }

        // 3. Limit the results
        const contentToShow = limit ? filteredContent.slice(0, limit) : filteredContent;

        // 4. Render the HTML
        if (contentToShow.length === 0) {
            feed.innerHTML = '<p class="text-gray-400 md:col-span-3 text-center">No content found for this category.</p>';
            return;
        }

        feed.innerHTML = contentToShow.map(item => `
            <div class="group bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-400/20">
                <a href="${item.linkUrl}" target="_blank" rel="noopener noreferrer" class="block">
                    <div class="${item.aspect || 'aspect-video'} w-full overflow-hidden">
                        <img src="${item.imageUrl}" 
                             alt="${item.title}" 
                             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                             onerror="this.src='https://placehold.co/600x400/1f2937/d1d5db?text=Image+Missing'; this.onerror=null;">
                    </div>
                </a>
                <div class="p-5 flex flex-col flex-grow">
                    <!-- NEW: Date Display -->
                    <p class="text-sm text-gray-400 mb-2">${formatDate(item.date)}</p>
                    
                    <h3 class="text-xl font-semibold text-white mb-2">
                        <a href="${item.linkUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-sky-400">
                            ${item.title}
                        </a>
                    </h3>
                    <p class="text-gray-300 text-base flex-grow">${item.description}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error rendering content:', error);
        feed.innerHTML = `<p class="text-red-400 md:col-span-3 text-center">Failed to load content. ${error.message}</p>`;
    }
}

/**
 * Formats a "YYYY-MM-DD" date string into "Month Day, Year".
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {string} The formatted date.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}