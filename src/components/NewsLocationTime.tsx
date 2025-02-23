import { useEffect, useState } from 'react';

const NewsLocationTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-1">
      <div className="bg-black text-white px-3 py-1 text-2xl font-medium">
        New York
      </div>
      <div className="bg-black text-white px-3 py-1 text-2xl font-medium">
        {formatTime(time)} ET
      </div>
    </div>
  );
};

export default NewsLocationTime; 