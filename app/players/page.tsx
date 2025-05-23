export default async function PlayersPage() {
    const res = await fetch("https://localhost:3000/api", {
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        return <div>failed get players</div>;
    }

    const data: any = await res.json();
    const players: string[] = data.players || [];

    return (
        <div>
            <h1>players</h1>
            <ul>
                {players.map((player, i) => (
                    <li key={i}>{player}</li>
                ))}
            </ul>
        </div>
    );
}
