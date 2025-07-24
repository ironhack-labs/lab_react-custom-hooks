import { useFetch } from '../hooks/useFetch'

const PublicGists = () => {
	const {
		data: gists,
		loading,
		error,
	} = useFetch("https://api.github.com/gists/public");

	if (loading) return <p>Loading public gists...</p>;
	if (error) return <p>Error fetching gists: {error.message}</p>;
	return (
		<div>
			<h2>Public Gists</h2>
			<ul>
				{gists &&
					gists.map((gist) => (
						<li key={gist.id}>
							<a
								href={gist.html_url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{gist.description || "No description"}
							</a>
						</li>
					))}
			</ul>
		</div>
	);
};

export default PublicGists;
