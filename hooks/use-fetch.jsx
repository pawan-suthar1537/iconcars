import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setdata] = useState(undefined);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const fn = async (...args) => {
    setloading(true);
    seterror(null);
    try {
      const res = await cb(...args);
      setdata(res);
      seterror(null);
    } catch (error) {
      seterror(error);
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  };

  return { data, loading, error, fn, setdata };
};

export default useFetch;
