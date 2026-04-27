export const safeParse = (val: string) => {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

export const parseGallery = (gallery: string | string[]) => {
  if (Array.isArray(gallery)) return gallery;
  if (typeof gallery === 'string') {
    try {
      return JSON.parse(gallery);
    } catch {
      return [];
    }
  }
  return [];
};

// แล้วใน component
