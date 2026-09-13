import 'dotenv/config';
import { createApp } from './app.js';
const {app,db}=createApp();
const port=Number(process.env.PORT||3000);
const host=process.env.HOST||'127.0.0.1';
const server=app.listen(port,host,()=>console.log(`metricamente disponible en http://${host}:${port}`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
