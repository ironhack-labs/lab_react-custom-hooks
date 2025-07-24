import { useState, useEffect } from "react";
import axios from "axios";

export function useFetch(url) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController(); // 1. Create AbortController

		const fetchData = async () => {
			try {
				setLoading(true);
				// 2. Pass signal to axios
				const response = await axios.get(url, {
					signal: controller.signal,
				});
				setData(response.data);
				setError(null);
			} catch (err) {
				// 4. Handle cancellation error
				if (axios.isCancel(err)) {
					console.log("Request canceled:", err.message);
					return;
				}
				setError(err);
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		// 3. Return cleanup function
		return () => {
			controller.abort();
		};
	}, [url]);

	return { data, loading, error };
}
