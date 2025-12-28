interface WikipediaImage {
  source: string;
  width: number;
  height: number;
}

interface WikipediaImageInfo {
  imageinfo: WikipediaImage[];
}

interface PageData {
  title: string;
  imageUrl: string | null;
}

const fetchPageWithImage = async (pageTitle: string): Promise<PageData> => {
  try {
    // Fetch page info and image in a single request with redirects enabled
    const pageResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        pageTitle
      )}&redirects=true&prop=pageimages|pageterms&pithumbsize=250&format=json&origin=*`
    );

    const pageData = await pageResponse.json();
    const pages = pageData.query.pages;
    const page = Object.values(pages)[0] as any;

    if (page.thumbnail?.source) {
      return { title: pageTitle, imageUrl: page.thumbnail.source };
    }

    // Fallback: try to get page image via images property
    if (page.images && page.images.length > 0) {
      const imageName = page.images[0].title;
      
      const imageInfoResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          imageName
        )}&prop=imageinfo&iiprop=url&format=json&origin=*`
      );

      const imageInfoData = await imageInfoResponse.json();
      const imagePages = imageInfoData.query.pages;
      const imagePage = Object.values(imagePages)[0] as WikipediaImageInfo;

      if (imagePage.imageinfo && imagePage.imageinfo.length > 0) {
        return { title: pageTitle, imageUrl: imagePage.imageinfo[0].source };
      }
    }

    return { title: pageTitle, imageUrl: null };
  } catch (error) {
    console.error('Error fetching page with image:', error);
    return { title: pageTitle, imageUrl: null };
  }
};

export const resolveWikipediaName = async (
  figureName: string
): Promise<string | null> => {
  try {
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        figureName
      )}&format=json&origin=*`
    );

    const searchData = await searchResponse.json();

    if (!searchData.query.search.length) {
      return null;
    }

    return searchData.query.search[0].title;
  } catch (error) {
    console.error('Error resolving Wikipedia name:', error);
    return null;
  }
};

export const fetchWikipediaImage = async (
  pageTitle: string
): Promise<string | null> => {
  try {
    const pageData = await fetchPageWithImage(pageTitle);
    return pageData.imageUrl;
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
    return null;
  }
};

export const getWikipediaUrl = (figureName: string): string => {
  return `https://en.wikipedia.org/wiki/${figureName.replace(/ /g, '_')}`;
};

export const searchWikipediaSuggestions = async (
  query: string
): Promise<string[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&srlimit=8&format=json&origin=*`
    );

    const data = await response.json();
    return data.query.search.map((result: any) => result.title) || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};
