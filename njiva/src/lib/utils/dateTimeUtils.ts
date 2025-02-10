export const getUserLocalDateTime = (): string => {
    return new Date().toISOString(); // Returns user's local time in ISO format
  };
  
  export const convertUTCToLocal = (utcDateString: string): string => {
    const date = new Date(utcDateString);
    return date.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };


  export const formatDateTime = (date: string | null, time: string | null) => {
    if (!date) return null;
    const dateObj = new Date(date + (time ? `T${time}Z` : ''));
    return {
      date: dateObj.toLocaleDateString(),
      time: time ? dateObj.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : null
    };
  };

  export const toUTC = (date: string | null, time: string | null) => {
    if (!date || !time) return null;
    const localDateTime = new Date(`${date}T${time}`);
    return localDateTime.toISOString().split('T')[1].slice(0, 5); // Returns UTC time in HH:mm format
};
  