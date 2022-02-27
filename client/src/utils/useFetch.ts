import { onMounted, ref } from "vue"

const APIKEY = import.meta.env.VITE_GIPHY_API;
const gifUrl = ref("https://media.giphy.com/media/lz67zZWfWPsWnuGH0s/giphy.gif")

export const useFetch = ({ keyword }) => {
  console.log(keyword);
  
  keyword = keyword;
  const fetchGifs = async () => {
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${APIKEY}&q=${keyword.split(" ").join("")}&limit=1`);
      const { data } = await response.json();
      console.log(data[0].images.original.url);

      return gifUrl.value = data[0].images.downsized_medium.url
    } catch (error) {
      gifUrl.value = "https://media.giphy.com/media/lz67zZWfWPsWnuGH0s/giphy.gif"
    }
  };

  onMounted(() => {
    if (keyword) fetchGifs();
  });

  return gifUrl;
};

export default useFetch;