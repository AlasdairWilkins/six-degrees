const apiUrl = import.meta.env.VITE_API_URL;

export default async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    return await fetch([apiUrl, url].join(""), options);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
