import API from "./axios";
import { toast } from "react-toastify";

export const safeGet = async (url, fallback = []) => {
  try {
    const res = await API.get(url);
    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];
    console.log(`✅ Fetched from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching from ${url}:`, error);
    toast.error(`Error fetching data from ${url}`);
    return fallback;
  }
};