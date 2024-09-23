// Create the cover image URL based on the cover ID in the API
export function getCoverImageUrl(coverId, size = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

