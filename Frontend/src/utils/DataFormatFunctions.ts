export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) 
    return "Today";
  else if (date.toDateString() === yesterday.toDateString()) 
    return "Yesterday";
  else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

export const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}
