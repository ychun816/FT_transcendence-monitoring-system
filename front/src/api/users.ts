import { client } from "./client";

export async function getUserProfile(id: string): Promise<{
  id: string;
  username: string;
  email: string;
  authority: "NORMAL" | "ADMIN";
} | null> {
  const result = await client.get(`/users/${id}`);
  if (result.result === true) return result.data;
  return null;
}
