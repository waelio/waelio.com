import { onMounted, ref } from "vue"

const APIKEY = import.meta.env.VITE_GIPHY_API;

export const useFetch = ({ keyword }) => {
  keyword = keyword || { keyword: "hello" };
  const gifUrl = ref()
  const fetchGifs = async () => {
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${APIKEY}&q=${keyword.split(" ").join("")}&limit=1`);
      const { data } = await response.json();

      gifUrl.value = data[0]?.images?.downsized_medium.url
    } catch (error) {
      gifUrl.value = "https://metro.co.uk/wp-content/uploads/2015/05/pokemon_crying.gif?quality=90&strip=all&zoom=1&resize=500%2C284"
    }
  };

  onMounted(() => {
    if (keyword) fetchGifs();
  });

  return gifUrl;
};

export default useFetch;