import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server/app.js';
if(!process.env.GEMINI_API_KEY) {
  console.log('PENDIENTE DE VERIFICACIÓN REAL: falta GEMINI_API_KEY. No se ejecutó ni simuló una corrida.');
  process.exitCode=2;
} else {
  const {db,store,agent}=createApp();
  const userId=randomUUID();store.ensureUser(userId);
  try {
    const result=await agent.run('module',userId,{intent:'Quiero aprender el costo de adquisición de clientes (CAC) en Marketing',module_id:randomUUID(),version:1,area:'Marketing'});
    store.addModule(result.data,userId,result.run_id);
    console.log(JSON.stringify({kind:'implementation_smoke_not_academic',status:'PASS',user_id:userId,run_id:result.run_id,module_id:result.data.module_id}));
  } finally {db.close();}
}
