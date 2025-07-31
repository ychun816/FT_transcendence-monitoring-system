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

export interface GamedataPongDto {
  y: number;
  ball?: { x: number; y: number };
}

export enum OrientationEnum {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  DOWN = "DOWN",
}

export interface GamedataShootDto {
  x: number;
  y: number;
  orientation: OrientationEnum;
  balls: { x: number; y: number }[];
}

export interface UseGameDataProps<TGamedata> {
  sendGamedata: (send: (data: TGamedata) => void) => void;
}

export function useGameData<TGametype, TGamedata>(
  params: UseGameDataProps<TGamedata>
) {
  const client = io(
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:61001",
    { autoConnect: false, transports: ["websocket"] }
  );

  const [isConnected, setIsConnected] = useState(false);
  const [registerQueueStatus, setRegisterQueueStatus] =
    useState<RegisterQueueStatus>(RegisterQueueStatus.NOT_REGISTERED);
  const [ingameData, setIngameData] = useState<GameData<TGametype> | null>(
    null
  );
  const [status, setStatus] = useState<IngameStatus | null>(null);
  const [gamedata, setGamedata] = useState<TGametype | null>(null);
  const [readyUsers, setReadyUsers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (ingameData && ingameData.status !== status) {
      setStatus(ingameData.status);
    }
  }, [ingameData, status]);

  useEffect(() => {
    client.connect();

    client.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    client.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
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
      params.sendGamedata((data) => client.emit("gamedata", data));
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

    client.on("gamedata-winner", (data: { winner: string }) => {
      setWinner(data.winner);
    });

    return () => {
      client.disconnect();
    };
  }, []);

  return {
    isConnected,
    registerQueueStatus,
    ingameData,
    gamedata,
    readyUsers,
    client,
    status,
    winner,
  };
}
