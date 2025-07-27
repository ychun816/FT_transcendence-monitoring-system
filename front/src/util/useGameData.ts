"use client";

import { getGameHistoryList } from "@/api/game-history";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export enum RegisterQueueStatus {
  REGISTERED = "REGISTERED",
  UNREGISTERED = "UNREGISTERED",
  NOT_REGISTERED = "NOT_REGISTERED",
  ALREADY_REGISTERED = "ALREADY_REGISTERED",
}

export enum IngameStatus {
  WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS",
  LOBBY = "LOBBY",
  IN_PROGRESS = "IN_PROGRESS",
  NEXT_ROUND_SELECT = "NEXT_ROUND_SELECT",
  INTERMISSION = "INTERMISSION",
  TERMINATED = "TERNIMATED",
  PAUSED = "PAUSED",
}

export enum GametypeEnum {
  PONG = "PONG",
  SHOOT = "SHOOT",
}

export interface GameData<TGametype> {
  id: string;
  data: TGametype | null;
  status: IngameStatus;
  gametype: GametypeEnum;
  tournamentHistory: [string, string][][];
}

export interface UseGameDataProps {}

export function useGameData<TGametype>(props?: UseGameDataProps) {
  const client = io(
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:61001",
    { autoConnect: false, transports: ["websocket"] }
  );

  const [registerQueueStatus, setRegisterQueueStatus] =
    useState<RegisterQueueStatus>(RegisterQueueStatus.NOT_REGISTERED);
  const [ingameData, setIngameData] = useState<GameData<TGametype> | null>(
    null
  );
  const [gamedata, setGamedata] = useState<TGametype | null>(null);
  const [readyUsers, setReadyUsers] = useState<string[]>([]);

  useEffect(() => {
    client.connect();

    client.on("connect", () => {
      console.log("Connected to server");
    });

    client.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    client.on("game-session", (data: GameData<TGametype>) => {
      setIngameData(data);
    });

    client.on("register-queue", (data: RegisterQueueStatus) => {
      console.log("Register Queue Status:", data);
      setRegisterQueueStatus(data);
    });

    client.on("ingame-comm", (data: GameData<TGametype>) => {
      setIngameData(data);
    });

    client.on("gamedata", (data: TGametype) => {
      setGamedata(data);
    });

    client.on("ready-user", (userid: string) => {
      setReadyUsers((prev) => [...prev, userid]);
    });

    client.on("cancel-ready-user", (userid: string) => {
      setReadyUsers((prev) => prev.filter((id) => id !== userid));
    });

    client.on(
      "game-config",
      (data: { user: string; color: string; map: string }) => {
        if (ingameData && ingameData.lobbyData) {
          setIngameData((prev) => ({
            ...prev,
            lobbyData: {
              ...prev.lobbyData,
              [data.user]: {
                ...prev.lobbyData[data.user],
                color: data.color,
                map: data.map,
              },
            },
          }));
        }
      }
    );

    client.on("gamedata-winner");

    return () => {
      client.disconnect();
    };
  }, []);

  return { registerQueueStatus, ingameData, gamedata, readyUsers };
}
