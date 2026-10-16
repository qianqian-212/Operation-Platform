import type {
  LayeredTrainingGroupImportSheet,
  LayeredTrainingGroupMemberDraft,
} from "@/features/layered-training-group/types";

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_SIGNATURE = 0x06054b50;
const FIELD_HEADERS: Record<keyof LayeredTrainingGroupMemberDraft, readonly string[]> = {
  schoolName: ["学校名称(校区)", "学校名称"],
  teacherName: ["老师姓名"],
  phone: ["手机号码", "电话号码"],
};

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
}

function readError() {
  return new Error("无法读取 Excel 文件");
}

function assertRange(view: DataView, offset: number, length: number) {
  if (offset < 0 || length < 0 || offset + length > view.byteLength) throw readError();
}

function sliceBytes(view: DataView, offset: number, length: number) {
  assertRange(view, offset, length);
  return new Uint8Array(view.buffer, view.byteOffset + offset, length);
}

function findEocd(view: DataView) {
  const min = Math.max(0, view.byteLength - 22 - 65535);
  for (let offset = view.byteLength - 22; offset >= min; offset -= 1) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) return offset;
  }
  throw readError();
}

function readCentralEntries(view: DataView) {
  const eocd = findEocd(view);
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    assertRange(view, cursor, 46);
    if (view.getUint32(cursor, true) !== CENTRAL_SIGNATURE) throw readError();
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = new TextDecoder().decode(sliceBytes(view, cursor + 46, nameLength));
    entries.push({ name: name.replace(/^\//, ""), method, compressedSize, localOffset });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function byteStream(bytes: Uint8Array) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

async function inflate(bytes: Uint8Array, method: number) {
  if (method === 0) return bytes.slice();
  if (method !== 8) throw readError();
  const inflated = byteStream(bytes).pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(inflated).arrayBuffer());
}

async function readEntryBytes(view: DataView, entry: ZipEntry) {
  assertRange(view, entry.localOffset, 30);
  if (view.getUint32(entry.localOffset, true) !== LOCAL_SIGNATURE) throw readError();
  const nameLength = view.getUint16(entry.localOffset + 26, true);
  const extraLength = view.getUint16(entry.localOffset + 28, true);
  const start = entry.localOffset + 30 + nameLength + extraLength;
  return inflate(sliceBytes(view, start, entry.compressedSize), entry.method);
}

function parseXml(source: string) {
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.documentElement.localName === "parsererror") throw readError();
  return doc;
}

function descendants(root: Document | Element, name: string) {
  const found: Element[] = [];
  for (const node of root.getElementsByTagName("*")) {
    if (node.localName === name) found.push(node);
  }
  return found;
}

function childByName(parent: Element, name: string) {
  for (const node of parent.children) {
    if (node.localName === name) return node;
  }
  return undefined;
}

function elementText(element: Element) {
  return descendants(element, "t")
    .map((node) => node.textContent ?? "")
    .join("");
}

function columnIndex(ref: string) {
  const letters = ref.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return -1;
  let index = 0;
  for (const char of letters) index = index * 26 + char.charCodeAt(0) - 64;
  return index - 1;
}

function cellText(cell: Element, shared: readonly string[]) {
  const type = cell.getAttribute("t") ?? "";
  if (type === "inlineStr") {
    const inline = childByName(cell, "is");
    return inline ? elementText(inline).trim() : "";
  }
  const raw = childByName(cell, "v")?.textContent?.trim() ?? "";
  if (type !== "s") return raw;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0) return "";
  return (shared[index] ?? "").trim();
}

function readRows(doc: XMLDocument, shared: readonly string[]) {
  const rows: string[][] = [];
  for (const row of descendants(doc, "row")) {
    const values: string[] = [];
    let fallback = 0;
    let width = 0;
    for (const cell of row.children) {
      if (cell.localName !== "c") continue;
      const index = columnIndex(cell.getAttribute("r") ?? "");
      const column = index >= 0 ? index : fallback;
      values[column] = cellText(cell, shared);
      fallback = column + 1;
      width = Math.max(width, fallback);
    }
    const filled: string[] = [];
    for (let index = 0; index < width; index += 1) filled.push(values[index] ?? "");
    rows.push(filled);
  }
  return rows;
}

function headerIndex(headers: readonly string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(header.trim()));
}

function toSheet(groupName: string, rows: string[][]) {
  const header = rows[0];
  if (!header) throw new Error(`工作表「${groupName}」缺少表头`);
  const schoolIndex = headerIndex(header, FIELD_HEADERS.schoolName);
  const teacherIndex = headerIndex(header, FIELD_HEADERS.teacherName);
  const phoneIndex = headerIndex(header, FIELD_HEADERS.phone);
  if (schoolIndex < 0 || teacherIndex < 0 || phoneIndex < 0) {
    throw new Error("请按说明提供学校名称(校区)、老师姓名、手机号码三列");
  }
  const data: LayeredTrainingGroupMemberDraft[] = [];
  for (const row of rows.slice(1)) {
    const schoolName = row[schoolIndex] ?? "";
    const teacherName = row[teacherIndex] ?? "";
    const phone = row[phoneIndex] ?? "";
    if (!schoolName && !teacherName && !phone) continue;
    data.push({ schoolName, teacherName, phone });
  }
  return { groupName, rows: data };
}

function relationshipId(sheet: Element) {
  for (const attribute of sheet.attributes) {
    if (attribute.localName === "id") return attribute.value;
  }
  return "";
}

function joinPackagePath(base: string, target: string) {
  if (target.startsWith("/")) return target.slice(1);
  const dir = base.slice(0, base.lastIndexOf("/") + 1);
  const stack: string[] = [];
  for (const part of `${dir}${target}`.split("/")) {
    if (part === "..") stack.pop();
    else if (part && part !== ".") stack.push(part);
  }
  return stack.join("/");
}

function readSheets(
  files: Map<string, Uint8Array>,
  workbook: XMLDocument,
  rels: XMLDocument,
  shared: readonly string[],
) {
  const targets = new Map<string, string>();
  for (const rel of descendants(rels, "Relationship")) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target) targets.set(id, joinPackagePath("xl/workbook.xml", target));
  }
  const sheets: LayeredTrainingGroupImportSheet[] = [];
  for (const sheet of descendants(workbook, "sheet")) {
    const groupName = sheet.getAttribute("name")?.trim() ?? "";
    if (!groupName) throw new Error("工作表名称不能为空");
    const path = targets.get(relationshipId(sheet));
    const bytes = path ? files.get(path) : undefined;
    if (!bytes) throw readError();
    sheets.push(toSheet(groupName, readRows(parseXml(new TextDecoder().decode(bytes)), shared)));
  }
  if (sheets.length === 0) throw new Error("未找到工作表");
  return sheets;
}

function requiredFile(files: Map<string, Uint8Array>, name: string) {
  const found = files.get(name);
  if (!found) throw readError();
  return found;
}

export async function parseGroupWorkbook(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const files = new Map<string, Uint8Array>();
  for (const entry of readCentralEntries(view)) {
    if (entry.name.endsWith("/")) continue;
    files.set(entry.name, await readEntryBytes(view, entry));
  }
  const sharedBytes = files.get("xl/sharedStrings.xml");
  const shared = sharedBytes
    ? descendants(parseXml(new TextDecoder().decode(sharedBytes)), "si").map(elementText)
    : [];
  return readSheets(
    files,
    parseXml(new TextDecoder().decode(requiredFile(files, "xl/workbook.xml"))),
    parseXml(new TextDecoder().decode(requiredFile(files, "xl/_rels/workbook.xml.rels"))),
    shared,
  );
}
