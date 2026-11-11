import {cookie} from './_utils.js';
export function onRequestPost() {return new Response(null,{status:204,headers:{'Set-Cookie':cookie('er_session','',0)}});}
