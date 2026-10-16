import { describe, expect, it } from "vitest";
import { parseGroupWorkbook } from "@/features/layered-training-group/parse-group-workbook";

const RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

function workbookXml(name: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
}

function sheetXml(phone: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>学校名称(校区)</t></is></c>
      <c r="B1" t="inlineStr"><is><t>老师姓名</t></is></c>
      <c r="C1" t="inlineStr"><is><t>手机号码</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>第一小学</t></is></c>
      <c r="B2" t="inlineStr"><is><t>张晓晓</t></is></c>
      <c r="C2" t="inlineStr"><is><t>${phone}</t></is></c>
    </row>
  </sheetData>
</worksheet>`;
}

function u16(value: number) {
  return [value & 0xff, (value >> 8) & 0xff];
}

function u32(value: number) {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}

function concatBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function buildZip(files: Array<{ name: string; data: Uint8Array; stored: Uint8Array; method: number }>) {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const local = Uint8Array.from([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(file.method),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(file.stored.length),
      ...u32(file.data.length),
      ...u16(nameBytes.length),
      ...u16(0),
    ]);
    locals.push(local, nameBytes, file.stored);
    central.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(file.method),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(file.stored.length),
      ...u32(file.data.length),
      ...u16(nameBytes.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...nameBytes,
    );
    offset += local.length + nameBytes.length + file.stored.length;
  }
  const directory = Uint8Array.from(central);
  const eocd = Uint8Array.from([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(directory.length),
    ...u32(offset),
    ...u16(0),
  ]);
  return toArrayBuffer(concatBytes([...locals, directory, eocd]));
}

function storedFiles(name: string, phone: string) {
  const encoder = new TextEncoder();
  return [
    ["xl/workbook.xml", workbookXml(name)],
    ["xl/_rels/workbook.xml.rels", RELS],
    ["xl/worksheets/sheet1.xml", sheetXml(phone)],
  ].map(([path, text]) => {
    const data = encoder.encode(text ?? "");
    return { name: path ?? "", data, stored: data, method: 0 };
  });
}

describe("parse group workbook", () => {
  it("reads a group sheet from an uncompressed workbook", async () => {
    const sheets = await parseGroupWorkbook(buildZip(storedFiles("青年教师组", "13800000001")));
    expect(sheets).toEqual([
      {
        groupName: "青年教师组",
        rows: [{ schoolName: "第一小学", teacherName: "张晓晓", phone: "13800000001" }],
      },
    ]);
  });

  it("reads a deflated workbook the way Excel stores it", async () => {
    const files = await Promise.all(
      storedFiles("骨干研修组", "13800000002").map(async (file) => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(file.data);
            controller.close();
          },
        }).pipeThrough(new CompressionStream("deflate-raw"));
        return { ...file, stored: new Uint8Array(await new Response(stream).arrayBuffer()), method: 8 };
      }),
    );
    const sheets = await parseGroupWorkbook(buildZip(files));
    expect(sheets[0]?.groupName).toBe("骨干研修组");
    expect(sheets[0]?.rows[0]?.phone).toBe("13800000002");
  });

  it("rejects a sheet that is missing the phone column", async () => {
    const files = storedFiles("青年教师组", "13800000001").map((file) =>
      file.name.endsWith("sheet1.xml")
        ? {
            ...file,
            data: new TextEncoder().encode(
              `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>学校名称</t></is></c></row></sheetData></worksheet>`,
            ),
            stored: new TextEncoder().encode(
              `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>学校名称</t></is></c></row></sheetData></worksheet>`,
            ),
          }
        : file,
    );
    await expect(parseGroupWorkbook(buildZip(files))).rejects.toThrow("手机号码");
  });
});
