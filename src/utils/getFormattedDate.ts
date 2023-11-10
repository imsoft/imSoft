export const getFormattedDate = (dateString: string): string => {
  const parsedDate = Date.parse(dateString);

  if (isNaN(parsedDate)) {
    // Handle invalid date string
    console.error('Invalid date string:', dateString);
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(parsedDate));
};
