import { useState, useEffect, useRef } from "react";
import axios from "axios";

export interface PollingResponse {
  data: any | null;
  error: Error | null;
  isPolling: boolean;
}

const POLLING_FREQUENCY = 60000;
const API_URL = import.meta.env.VITE_API_URL;

const usePolling = (
  id: string,
  condition: boolean,
  callback: (requestId: string) => Promise<void>,
): PollingResponse => {
  const [data, setData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // what id there's no id
    if (id === "") {
      return;
    }
    
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/videos/${id}/status`
        );

        setData(response.data.video);

        // TODO: stop polling if it has been more than maybe one hour?
        if (response.data.video.status === "completed") {
          stopPolling();
          await callback(id);
        } else if (response.data.video.status === "error") {
          setError(response.data.video);
          stopPolling();
        }
      } catch (error: any) {
        stopPolling();

        console.error("Error fetching data:", error);
        setError(error);
      } finally {
        if (condition === false || error) {
          setIsPolling(false);
        }
      }
    };

    if (condition) {
      fetchData();
      setIsPolling(true);
      intervalIdRef.current = setInterval(fetchData, POLLING_FREQUENCY);

      return () => {
        stopPolling();
        setError(null);
      };
    } else {
      setIsPolling(false);
    }
  }, [id, condition]);

  const stopPolling = () => {
    if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
    }
    
    setIsPolling(false);
  }

  return { data, isPolling, error };
};

export default usePolling