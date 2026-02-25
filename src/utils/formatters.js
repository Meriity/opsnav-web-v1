const formatDate = (date) => {
  if (!date) return "N/A";
  let newDate = new Date(date);
  const yyyy = newDate.getFullYear();
  const mm = String(newDate.getMonth() + 1).padStart(2, "0");
  const dd = String(newDate.getDate()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
};

export const extractFirstName = (clientName = "") => {
  if (!clientName || typeof clientName !== "string") return "";
  let name = clientName.trim();
  // Remove content inside brackets and square brackets
  name = name.replace(/\(.*?\)|\[.*?\]/g, "").trim();
  // Case 1: Format like "LastName, Title FirstName"
  if (name.includes(",")) {
    const parts = name.split(",");
    name = parts[1]?.trim() || "";
  }
  // Remove titles (Mr, Ms, Mrs, Dr, Miss, Prof etc.)
  name = name.replace(
    /^(mr|ms|mrs|miss|dr|prof|mr\.|ms\.|dr\.)\s+/i,
    ""
  );
  // Split remaining words
  const words = name.split(/\s+/);
  // Return first valid word
  return words[0] || "";
};

export { formatDate };
