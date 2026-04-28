export const saveMapToLocalStorage = (map) => {
  localStorage.setItem("eventmaster_map", JSON.stringify(map));
};

export const loadMapFromLocalStorage = () => {
  const savedMap = localStorage.getItem("eventmaster_map");
  return savedMap ? JSON.parse(savedMap) : null;
};