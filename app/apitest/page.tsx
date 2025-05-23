"use client";

import { useEffect, useState } from "react";

type Result = {
    channel: string;
    playerA: string;
    playerB: string;
    YouTubeLink: string;
};

export default function ResultsPage() {
    const [players, setPlayers] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch("http://192.168.10.114:5000/results")
            .then((res) => res.json())
            .then((data) => {
                setPlayers(data as Result[]);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>players</h1>
            {isLoading && <p>Loading...</p>}
            {players.map((player, i) => (
                <div key={i}>
                    <p>
                        <strong>channel: </strong>
                        {player.channel}
                    </p>
                    <p>
                        <strong>playerA: </strong>
                        {player.playerA}
                    </p>
                    <p>
                        <strong>playerB: </strong>
                        {player.playerB}
                    </p>
                    <p>
                        <strong>YouTubeLink: </strong>
                        {player.YouTubeLink}
                    </p>
                </div>
            ))}
        </div>
    );
}
