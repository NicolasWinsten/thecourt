interface PageData {
  title: string;
  imageUrl: string | null;
}

const fetchPageWithImage = async (pageTitles: string[]): Promise<PageData[]> => {
  try {
    const titlesParam = pageTitles.join('|');
    // Fetch page info and image in a single request with redirects enabled
    const pageResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        titlesParam
      )}&redirects=true&prop=pageimages|pageterms&pithumbsize=250&format=json&origin=*`
    );

    const pageData = await pageResponse.json();
    const pages = pageData.query.pages;

    const results: PageData[] = pageTitles.map(title => {
      // Find the page by title since API returns pages by ID
      const page = Object.values(pages).find((p: any) => p.title === title) as any;

      if (!page) {
        return { title, imageUrl: null };
      }

      if (page.thumbnail?.source) {
        return { title, imageUrl: page.thumbnail.source };
      }

      return { title, imageUrl: null };
    });

    return results;
  } catch (error) {
    console.error('Error fetching pages with images:', error);
    return pageTitles.map(title => ({ title, imageUrl: null }));
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
  pageTitles: string[]
): Promise<(string | null)[]> => {
  try {
    const pageData = await fetchPageWithImage(pageTitles);
    return pageData.map(data => data.imageUrl);
  } catch (error) {
    console.error('Error fetching Wikipedia images:', error);
    return pageTitles.map(() => null);
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
