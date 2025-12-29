export const setTokens = ({ access, refresh }) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const getRefresh = () => localStorage.getItem("refresh");
export const hasAccess = () => !!localStorage.getItem("access");
