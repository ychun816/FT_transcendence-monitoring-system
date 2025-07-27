import { client } from "./client";

export async function login (params: {
    email : string, 
    password: string;
}) : Promise<string> {
    const response = await client.post('/auth/login', params);
    if (typeof response.data === 'string')
        return response.data;
    else
        throw new Error("va te faire foutre");
}

export async function register (params : {
    email : string,
    password: string;
    nickname: string;
}) : Promise<void> {
    const response = await client.post('/users', params);
    if (typeof response.data === 'string')
        return;
    else
    {
        console.error(response.data);
        throw new Error(response.data.message);
    }
}