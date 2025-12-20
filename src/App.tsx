import { useEffect } from "react";
import Router from "./routes/Routes.tsx";
import { useFavoriteStore } from "./store/favoriteStore";

function App() {
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites);

  useEffect(() => {
    loadFavorites();   
  }, []);

  return <Router />;
}

export default App;
