import {cookie,parseCookies,redirectUri,sign} from './_utils.js';
export async function onRequestGet({request,env}) {
 const url=new URL(request.url),code=url.searchParams.get('code'),state=url.searchParams.get('state');
 const saved=parseCookies(request).oauth_state;
 if(!code||!state||!saved||state!==saved) return new Response('Connexion refusée : état OAuth invalide.',{status:400});
 if(!env.DISCORD_CLIENT_ID||!env.DISCORD_CLIENT_SECRET||!env.SESSION_SECRET) return new Response('Configuration manquante.',{status:503});
 const tokenResponse=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,client_secret:env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:redirectUri})});
 if(!tokenResponse.ok)return new Response('Échec de la connexion Discord.',{status:502});
 const tokens=await tokenResponse.json();
 const profileResponse=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:`Bearer ${tokens.access_token}`}});
 if(!profileResponse.ok)return new Response('Profil Discord inaccessible.',{status:502});
 const profile=await profileResponse.json();
 const session=await sign({id:profile.id,username:profile.global_name||profile.username,exp:Date.now()+86400000},env.SESSION_SECRET);
 const headers=new Headers({Location:'/'});
 headers.append('Set-Cookie',cookie('er_session',session,86400));
 headers.append('Set-Cookie',cookie('oauth_state','',0));
 return new Response(null,{status:302,headers});
}
