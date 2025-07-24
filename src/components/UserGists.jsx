import { useFetch } from '../hooks/useFetch';

const UserGists = () => {
	const username = "gaearon"; // A famous React developer!
	const {
		data: gists,
		loading,
		error,
	} = useFetch(`https://api.github.com/users/${username}/gists`);

	if (loading) return <p>Loading {username}'s gists...</p>;
	if (error) return <p>Error fetching gists: {error.message}</p>;

	return (
		<div>
			<h2>{username}'s Gists</h2>
			<ul>
				{gists && gists.map((gist) => (
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

export default UserGists;