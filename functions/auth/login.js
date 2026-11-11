import {cookie,b64url,redirectUri} from './_utils.js';
export async function onRequestGet({env}) {
 if(!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.SESSION_SECRET) return new Response('Configuration Discord manquante.',{status:503});
 const state=b64url(crypto.getRandomValues(new Uint8Array(32)));
 const url=new URL('https://discord.com/oauth2/authorize');
 url.search=new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,response_type:'code',redirect_uri:redirectUri,scope:'identify guilds',state}).toString();
 return new Response(null,{status:302,headers:{Location:url.toString(),'Set-Cookie':cookie('oauth_state',state)}});
}
