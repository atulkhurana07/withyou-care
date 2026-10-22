import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { validatePrescriptionFile } from '../apps/website/src/lib/intake-files';
test('uploads reject forged files, undersized images, active PDFs and excessive pages',async()=>{
  await assert.rejects(validatePrescriptionFile(Buffer.from('<html>fake prescription</html>')));
  await assert.rejects(validatePrescriptionFile(await sharp({create:{width:100,height:100,channels:3,background:'white'}}).png().toBuffer()));
  const pdf=await PDFDocument.create(); for(let n=0;n<11;n++)pdf.addPage();
  await assert.rejects(validatePrescriptionFile(Buffer.from(await pdf.save())));
  const active=await PDFDocument.create();active.addPage();active.catalog.set(PDFName.of('OpenAction'),active.context.obj({S:'JavaScript',JS:PDFString.of('alert(1)')}));
  await assert.rejects(validatePrescriptionFile(Buffer.from(await active.save())));
});
test('accepted files preserve pages and images are decoded and stripped of metadata',async()=>{
  const pdf=await PDFDocument.create();pdf.addPage();pdf.addPage();
  assert.equal((await validatePrescriptionFile(Buffer.from(await pdf.save()))).pages,2);
  const image=await sharp({create:{width:500,height:700,channels:3,background:'white'}}).jpeg().toBuffer();
  const output=await validatePrescriptionFile(image);assert.equal(output.type,'image/png');assert.equal((await sharp(output.bytes).metadata()).exif,undefined);
});
