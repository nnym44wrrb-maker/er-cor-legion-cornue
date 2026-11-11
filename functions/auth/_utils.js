const encoder = new TextEncoder();
export const redirectUri = 'https://er-cor-legion-cornue.pages.dev/auth/callback';
export function cookie(name, value, maxAge=600, httpOnly=true) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax${httpOnly?'; HttpOnly':''}`;
}
export function parseCookies(request) {
  return Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(s=>s.trim().split(/=(.*)/s).slice(0,2)).filter(x=>x.length===2));
}
export function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function unb64(s) {return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));}
async function signingKey(secret) {return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function sign(payload,secret) {
 const data=b64url(encoder.encode(JSON.stringify(payload)));
 const sig=await crypto.subtle.sign('HMAC',await signingKey(secret),encoder.encode(data));
 return data+'.'+b64url(new Uint8Array(sig));
}
export async function verify(token,secret) {
 try {const [data,sig]=token.split('.');if(!data||!sig)return null;
 const valid=await crypto.subtle.verify('HMAC',await signingKey(secret),unb64(sig),encoder.encode(data));
 if(!valid)return null;const payload=JSON.parse(new TextDecoder().decode(unb64(data)));
 return payload.exp>Date.now()?payload:null;
 }catch{return null;}
}
