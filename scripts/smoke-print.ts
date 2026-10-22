import { request } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const api = await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{origin:"http://127.0.0.1:3000"}});
async function post(path:string, data:unknown) {const response=await api.post(`/api/${path}`,{data});if(!response.ok()) throw new Error(`Print fixture action failed: ${response.status()}`);return response.json();}
try {
  await post("session",{email:"reception@withyou.test",password:"WithYouDemo2026!"});
  const patient=await post("patients",{name:`परीक्षण रोगी ${Date.now()}`,age:52,phone:"",language:"Hindi",invitationOptIn:false});
  await post("session",{email:"doctor@withyou.test",password:"WithYouDemo2026!"});
  const report=await post("reports",{patientId:patient.id,notes:"",medicine:{name:"उदाहरण दवा",strength:"10mg",dose:"एक गोली",route:"मुँह से",frequency:"once daily",times:"08:00",start:"2026-10-13",end:"2026-10-15",food:"खाने के बाद"},followUp:"",followUpDate:"",followUpTime:""});
  await post(`reports/${report.id}/review`,{id:report.candidates[0].id,action:"verified"});await post(`reports/${report.id}/publish`,{});
  const pdf=await api.get(`/api/reports/${report.id}/pdf`);if(!pdf.ok()) throw new Error(`PDF failed: ${pdf.status()}`);
  await mkdir("tmp/pdfs",{recursive:true});await writeFile("tmp/pdfs/clinical-hindi.pdf",await pdf.body());console.log("Synthetic Hindi report generated through the authorized API.");
} finally {await api.dispose();}
