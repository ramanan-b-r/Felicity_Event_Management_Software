
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  alert("You have been logged out.");
  window.location.href = "/";
};

export default logout