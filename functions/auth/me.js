import {parseCookies,verify} from './_utils.js';
export async function onRequestGet({request,env}) {
 const session=env.SESSION_SECRET?await verify(parseCookies(request).er_session||'',env.SESSION_SECRET):null;
 return Response.json(session?{authenticated:true,user:{id:session.id,username:session.username}}:{authenticated:false},{headers:{'Cache-Control':'no-store'}});
}
