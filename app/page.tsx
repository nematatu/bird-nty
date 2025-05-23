"use client";

import { useEffect, useState } from "react";
import {
    Youtube,
    RefreshCw,
    ExternalLink,
    Bell,
    BellOff,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

interface Player {
    playerA: string;
    playerB: string;
    YouTubeLink: string;
}

interface MatchData {
    [key: string]: Player;
}

interface Tournament {
    id: string;
    name: string;
    date: string;
    isActive: boolean;
}

export default function MatchDashboard() {
    const [matchData, setMatchData] = useState<MatchData>({
        A: {
            playerA: "松居 圭一郎・玉手 勝輝",
            playerB: "金子 真大・齋藤 駿",
            YouTubeLink: "https://www.youtube.com/watch?v=ecCk2cMjAHo",
        },
        B: {
            playerA: "澤田 修志・石井 叶夢",
            playerB: "柴田 一樹・山田 尚輝",
            YouTubeLink: "https://www.youtube.com/watch?v=Hb8y6foGKn4",
        },
        C: {
            playerA: "",
            playerB: "",
            YouTubeLink: "https://www.youtube.com/watch?v=aGaeQlHmuRs",
        },
        D: {
            playerA: "山北 奈緖・鈴木 陽向",
            playerB: "櫻本 絢子・関野 里真",
            YouTubeLink: "https://www.youtube.com/watch?v=qf_NCGg67Jo",
        },
    });
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [countdown, setCountdown] = useState<number>(15 * 60);
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
        "notifications-enabled",
        false,
    );
    const [selectedPlayers, setSelectedPlayers] = useLocalStorage<string[]>(
        "selected-players",
        [],
    );
    const [previousMatchData, setPreviousMatchData] = useState<MatchData | null>(
        null,
    );
    const [tournaments, setTournaments] = useState<Tournament[]>([
        {
            id: "ranking",
            name: "ランキングサーキット",
            date: "2025年5月",
            isActive: true,
        },
        {
            id: "interhigh",
            name: "インターハイ",
            date: "2025年7月",
            isActive: false,
        },
        {
            id: "corporate",
            name: "全日本社会人",
            date: "2025年9月",
            isActive: false,
        },
        {
            id: "general",
            name: "全日本総合選手権",
            date: "2025年12月",
            isActive: false,
        },
    ]);
    const [activeTournament, setActiveTournament] = useState<string>("ranking");
    const [isPlayerSelectorOpen, setIsPlayerSelectorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 実際の実装では、ここでAPIからデータを取得します
    const fetchMatchData = async () => {
        try {
            setIsLoading(true);

            // アニメーション用の遅延
            await new Promise((resolve) => setTimeout(resolve, 800));

            // 実際のAPIエンドポイントからデータを取得する
            // const response = await fetch('/api/matches?tournament=' + activeTournament);
            // const data = await response.json();

            // デモ用に現在のデータを保存
            setPreviousMatchData({ ...matchData });

            // デモ用に現在時刻を更新
            setLastUpdated(new Date());
            setCountdown(15 * 60);

            // 実際のAPIレスポンスを処理する代わりに、デモデータを使用
            // setMatchData(data);

            // 通知チェック
            if (previousMatchData && notificationsEnabled) {
                checkForNewMatches(matchData, previousMatchData);
            }

            toast({
                title: "データを更新しました",
                description: "最新の試合情報が反映されました",
            });
        } catch (error) {
            console.error("データの取得に失敗しました", error);
            toast({
                title: "エラー",
                description: "データの更新に失敗しました。後でもう一度お試しください。",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 新しい試合が始まったかチェックする
    const checkForNewMatches = (current: MatchData, previous: MatchData) => {
        Object.entries(current).forEach(([channel, data]) => {
            // 選手Aが空から値が入った場合（試合開始）
            if (
                (previous[channel].playerA === "" && data.playerA !== "") ||
                (previous[channel].playerB === "" && data.playerB !== "")
            ) {
                // 選択された選手が含まれているかチェック
                const matchIncludes = selectedPlayers.some(
                    (player) =>
                        data.playerA.includes(player) || data.playerB.includes(player),
                );

                if (matchIncludes) {
                    // 通知を送信
                    if (
                        "Notification" in window &&
                        Notification.permission === "granted"
                    ) {
                        new Notification("試合開始通知 | bird-ntf", {
                            body: `選択した選手の試合が始まりました！\nチャンネル ${channel}: ${data.playerA} vs ${data.playerB}`,
                            icon: "/favicon.ico",
                        });
                    }

                    // トースト通知も表示
                    toast({
                        title: "試合開始通知",
                        description: `選択した選手の試合が始まりました！\nチャンネル ${channel}: ${data.playerA} vs ${data.playerB}`,
                    });
                }
            }
        });
    };

    // 通知許可をリクエスト
    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast({
                title: "通知エラー",
                description: "お使いのブラウザは通知をサポートしていません。",
                variant: "destructive",
            });
            return;
        }

        if (Notification.permission === "granted") {
            setNotificationsEnabled(true);
            return;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setNotificationsEnabled(true);
                toast({
                    title: "通知が有効になりました",
                    description: "選択した選手の試合が始まると通知が届きます。",
                });
            } else {
                toast({
                    title: "通知が拒否されました",
                    description: "ブラウザの設定から通知を許可してください。",
                    variant: "destructive",
                });
            }
        }
    };

    // 選手の選択を切り替える
    const togglePlayerSelection = (playerName: string) => {
        setSelectedPlayers((prev) => {
            if (prev.includes(playerName)) {
                return prev.filter((p) => p !== playerName);
            } else {
                return [...prev, playerName];
            }
        });
    };

    // 通知の切り替え
    const toggleNotifications = async (enabled: boolean) => {
        if (enabled) {
            await requestNotificationPermission();
        } else {
            setNotificationsEnabled(false);
        }
    };

    useEffect(() => {
        // 初回ロード時にデータを取得
        fetchMatchData();

        // 15分ごとに自動更新
        const interval = setInterval(fetchMatchData, 15 * 60 * 1000);

        return () => clearInterval(interval);
    }, [activeTournament]);

    // カウントダウンタイマー
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 15 * 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // カウントダウン表示用のフォーマット
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // YouTubeのサムネイル画像URLを生成
    const getYouTubeThumbnail = (url: string) => {
        const videoId = url.split("v=")[1];
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    };

    // 全選手のリストを取得
    const getAllPlayers = () => {
        const players = new Set<string>();

        Object.values(matchData).forEach((match) => {
            if (match.playerA) {
                match.playerA
                    .split("・")
                    .forEach((player) => players.add(player.trim()));
            }
            if (match.playerB) {
                match.playerB
                    .split("・")
                    .forEach((player) => players.add(player.trim()));
            }
        });

        return Array.from(players).sort();
    };

    // 現在の大会名を取得
    const getCurrentTournamentName = () => {
        const tournament = tournaments.find((t) => t.id === activeTournament);
        return tournament ? tournament.name : "大会";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            bird-ntf
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <Badge variant="outline" className="text-xs">
                                {formatCountdown(countdown)}
                            </Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchMatchData}
                            disabled={isLoading}
                            className="flex items-center space-x-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                        >
                            <RefreshCw
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? "animate-spin" : ""}`}
                            />
                            <span className="hidden sm:inline">更新</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
                <div className="mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            2025年大会
                        </h2>

                        {/* モバイル向け大会選択ドロップダウン */}
                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs flex items-center gap-1"
                                    >
                                        {getCurrentTournamentName()}
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {tournaments.map((tournament) => (
                                        <DropdownMenuItem
                                            key={tournament.id}
                                            onClick={() => setActiveTournament(tournament.id)}
                                            className="text-xs"
                                        >
                                            {tournament.name} {tournament.isActive && "⚡"}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* デスクトップ向け大会選択バッジ */}
                        <div className="hidden sm:flex flex-wrap gap-2">
                            {tournaments.map((tournament) => (
                                <Badge
                                    key={tournament.id}
                                    variant={
                                        tournament.id === activeTournament ? "default" : "outline"
                                    }
                                    className="cursor-pointer text-xs sm:text-sm"
                                    onClick={() => setActiveTournament(tournament.id)}
                                >
                                    {tournament.name} {tournament.isActive && "⚡"}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        最終更新: {lastUpdated.toLocaleString("ja-JP")}
                        <span className="block sm:inline sm:ml-2 text-amber-600 dark:text-amber-400">
                            ※APIの制限により15分ごとの更新となります
                        </span>
                    </p>
                </div>

                {/* 折りたたみ可能な選手通知設定 */}
                <Card className="mb-4 sm:mb-6">
                    <Collapsible
                        open={isPlayerSelectorOpen}
                        onOpenChange={setIsPlayerSelectorOpen}
                    >
                        <div className="p-3 sm:p-4">
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                            選手通知設定
                                        </h3>
                                        <ChevronDown
                                            className={`h-4 w-4 text-gray-500 transition-transform ${isPlayerSelectorOpen ? "transform rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="notifications"
                                            checked={notificationsEnabled}
                                            onCheckedChange={toggleNotifications}
                                        />
                                        <Label
                                            htmlFor="notifications"
                                            className="flex items-center space-x-1"
                                        >
                                            {notificationsEnabled ? (
                                                <>
                                                    <Bell className="h-4 w-4 text-green-500" />
                                                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                                                        通知オン
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <BellOff className="h-4 w-4 text-gray-400" />
                                                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                                                        通知オフ
                                                    </span>
                                                </>
                                            )}
                                        </Label>
                                    </div>
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        選択した選手の試合が始まると通知が届きます。
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                                        {getAllPlayers().map((player) => (
                                            <div
                                                key={player}
                                                className="flex items-center space-x-1 sm:space-x-2"
                                            >
                                                <Checkbox
                                                    id={`player-${player}`}
                                                    checked={selectedPlayers.includes(player)}
                                                    onCheckedChange={() => togglePlayerSelection(player)}
                                                    className="h-3 w-3 sm:h-4 sm:w-4"
                                                />
                                                <Label
                                                    htmlFor={`player-${player}`}
                                                    className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                                                >
                                                    {player}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                </Card>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 sm:mb-6 w-full overflow-x-auto flex-nowrap">
                        <TabsTrigger value="all" className="text-xs sm:text-sm">
                            全チャンネル
                        </TabsTrigger>
                        <TabsTrigger value="A" className="text-xs sm:text-sm">
                            チャンネルA
                        </TabsTrigger>
                        <TabsTrigger value="B" className="text-xs sm:text-sm">
                            チャンネルB
                        </TabsTrigger>
                        <TabsTrigger value="C" className="text-xs sm:text-sm">
                            チャンネルC
                        </TabsTrigger>
                        <TabsTrigger value="D" className="text-xs sm:text-sm">
                            チャンネルD
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mx-auto max-w-6xl">
                            {Object.entries(matchData).map(([channel, data]) => (
                                <MatchCard
                                    key={channel}
                                    channel={channel}
                                    data={data}
                                    thumbnailUrl={getYouTubeThumbnail(data.YouTubeLink)}
                                    selectedPlayers={selectedPlayers}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {Object.entries(matchData).map(([channel, data]) => (
                        <TabsContent key={channel} value={channel}>
                            <MatchCard
                                channel={channel}
                                data={data}
                                thumbnailUrl={getYouTubeThumbnail(data.YouTubeLink)}
                                selectedPlayers={selectedPlayers}
                                large
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 sm:py-4 mt-4 sm:mt-6">
                <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    © 2025 bird-ntf | バドミントン試合通知アプリ | 15分ごとに自動更新
                </div>
            </footer>

            <Toaster />
        </div>
    );
}

interface MatchCardProps {
    channel: string;
    data: Player;
    thumbnailUrl: string;
    selectedPlayers: string[];
    large?: boolean;
}

function MatchCard({
    channel,
    data,
    thumbnailUrl,
    selectedPlayers,
    large = false,
}: MatchCardProps) {
    // 選択された選手が含まれているかチェック
    const hasSelectedPlayer = () => {
        if (selectedPlayers.length === 0) return false;

        return selectedPlayers.some(
            (player) =>
                data.playerA.includes(player) || data.playerB.includes(player),
        );
    };

    const isSelected = hasSelectedPlayer();

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                large ? "max-w-3xl mx-auto" : "",
                isSelected ? "ring-2 ring-green-500" : "",
            )}
        >
            <CardHeader className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="text-gray-900 dark:text-white">
                        チャンネル {channel}
                    </span>
                    <div className="flex items-center space-x-2">
                        {isSelected && (
                            <Badge className="bg-green-500 text-white text-xs">
                                選択選手
                            </Badge>
                        )}
                        <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-red-500 text-white"
                        >
                            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white inline-block"></span>
                            LIVE
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* サムネイルはモバイルでは非表示 */}
                <div className="relative hidden md:block">
                    <img
                        src={thumbnailUrl || "/placeholder.svg?height=270&width=480"}
                        alt={`チャンネル ${channel} サムネイル`}
                        className={`w-full object-cover ${large ? "h-80" : "h-48"}`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <a
                            href={data.YouTubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-700 transition-colors"
                        >
                            <Youtube className="h-5 w-5" />
                            <span>視聴する</span>
                        </a>
                    </div>
                </div>
                <div className="p-3 space-y-2">
                    {/* モバイル向けのコンパクトなレイアウト */}
                    <div className="md:hidden flex items-center justify-between mb-1">
                        <a
                            href={data.YouTubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 text-white px-2 py-1 text-xs rounded-full flex items-center space-x-1 hover:bg-red-700 transition-colors"
                        >
                            <Youtube className="h-3 w-3" />
                            <span>視聴</span>
                        </a>
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            選手A
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            {data.playerA || "未定"}
                        </p>
                    </div>
                    <div className="flex items-center justify-center my-1">
                        <span className="text-base sm:text-lg font-bold px-2 sm:px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                            VS
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            選手B
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            {data.playerB || "未定"}
                        </p>
                    </div>
                    <div className="pt-1 hidden md:block">
                        <a
                            href={data.YouTubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>YouTubeで視聴</span>
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
