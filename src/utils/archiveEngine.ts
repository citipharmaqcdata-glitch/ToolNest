import * as fflate from 'fflate';
import * as fzstd from 'fzstd';
import JSZip from 'jszip';
import * as seekBzip from 'seek-bzip';
import * as lzma from 'lzma';

export interface ArchiveEntry {
  name: string;
  size: number;
  compressedSize?: number;
  isDirectory: boolean;
  data?: Uint8Array;
  date?: Date;
  comment?: string;
}

export interface ArchiveInspection {
  formatName: string;
  magicVerified: boolean;
  headerDetails: string;
  entries: ArchiveEntry[];
  totalUncompressedSize: number;
  totalCompressedSize: number;
  fileCount: number;
  folderCount: number;
}

// Helper: Format bytes cleanly
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// -------------------------------------------------------------
// 1. TAR (Tape Archive) PARSER & BUILDER (USTAR Standard)
// -------------------------------------------------------------
export function parseTar(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  let offset = 0;
  const decoder = new TextDecoder('utf-8');

  while (offset + 512 <= buffer.length) {
    const headerBlock = buffer.subarray(offset, offset + 512);

    // End of archive is marked by two consecutive 512-byte zero blocks
    let isZeroBlock = true;
    for (let i = 0; i < 512; i++) {
      if (headerBlock[i] !== 0) {
        isZeroBlock = false;
        break;
      }
    }
    if (isZeroBlock) {
      // Check next block or end
      break;
    }

    // File name: bytes 0..99
    let nameEnd = 0;
    while (nameEnd < 100 && headerBlock[nameEnd] !== 0) {
      nameEnd++;
    }
    let name = decoder.decode(headerBlock.subarray(0, nameEnd)).trim();

    // Prefix for long paths (USTAR): bytes 345..499
    let prefixEnd = 345;
    while (prefixEnd < 500 && headerBlock[prefixEnd] !== 0) {
      prefixEnd++;
    }
    if (prefixEnd > 345) {
      const prefix = decoder.decode(headerBlock.subarray(345, prefixEnd)).trim();
      if (prefix) {
        name = `${prefix}/${name}`;
      }
    }

    // Size: bytes 124..135 (octal ASCII)
    const sizeStr = decoder.decode(headerBlock.subarray(124, 136)).trim();
    const size = parseInt(sizeStr, 8) || 0;

    // Typeflag: byte 156 ('0' or '\0' for normal file, '5' for directory)
    const typeFlag = String.fromCharCode(headerBlock[156]);
    const isDirectory = typeFlag === '5' || name.endsWith('/');

    // Timestamp: bytes 136..147 (octal ASCII)
    const mtimeStr = decoder.decode(headerBlock.subarray(136, 148)).trim();
    const mtime = parseInt(mtimeStr, 8) || 0;
    const date = mtime ? new Date(mtime * 1000) : new Date();

    offset += 512; // Advance past header

    const fileData = !isDirectory && size > 0 ? buffer.subarray(offset, offset + size) : new Uint8Array(0);

    entries.push({
      name: name.replace(/^(\.\/|\/)/, ''),
      size: size,
      isDirectory,
      data: fileData,
      date
    });

    // Advance past file content (padded to 512 bytes)
    const paddedSize = Math.ceil(size / 512) * 512;
    offset += paddedSize;
  }

  return entries;
}

export function buildTar(entries: { name: string; data: Uint8Array; isDirectory?: boolean }[]): Uint8Array {
  const blocks: Uint8Array[] = [];
  const encoder = new TextEncoder();

  for (const entry of entries) {
    const isDir = entry.isDirectory || entry.name.endsWith('/');
    const header = new Uint8Array(512);

    // Name (up to 100 bytes)
    const nameBytes = encoder.encode(entry.name);
    header.set(nameBytes.subarray(0, 99), 0);

    // Mode: 0000755 for dir, 0000644 for file
    const mode = isDir ? '0000755 \0' : '0000644 \0';
    header.set(encoder.encode(mode), 100);

    // UID & GID
    header.set(encoder.encode('0000000 \0'), 108);
    header.set(encoder.encode('0000000 \0'), 116);

    // Size (octal 11 chars + space)
    const sizeOctal = (isDir ? 0 : entry.data.length).toString(8).padStart(11, '0') + ' ';
    header.set(encoder.encode(sizeOctal), 124);

    // Mtime (current timestamp in octal)
    const mtimeOctal = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
    header.set(encoder.encode(mtimeOctal), 136);

    // Typeflag
    header[156] = isDir ? 53 : 48; // '5' or '0'

    // USTAR magic
    header.set(encoder.encode('ustar\0'), 257);
    header.set(encoder.encode('00'), 263);

    // Checksum calculation (fill checksum field with spaces first)
    for (let i = 148; i < 156; i++) {
      header[i] = 32; // ' '
    }
    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    const checksumStr = checksum.toString(8).padStart(6, '0') + '\0 ';
    header.set(encoder.encode(checksumStr), 148);

    blocks.push(header);

    if (!isDir && entry.data.length > 0) {
      blocks.push(entry.data);
      const remainder = entry.data.length % 512;
      if (remainder > 0) {
        blocks.push(new Uint8Array(512 - remainder));
      }
    }
  }

  // End of archive marker: 2 x 512 zero blocks
  blocks.push(new Uint8Array(1024));

  // Concatenate all blocks
  const totalLength = blocks.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const block of blocks) {
    result.set(block, pos);
    pos += block.length;
  }
  return result;
}

// -------------------------------------------------------------
// 2. ZIP EXTRACTOR & BUILDER
// -------------------------------------------------------------
export async function parseZip(buffer: Uint8Array): Promise<ArchiveEntry[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(buffer);
  const entries: ArchiveEntry[] = [];

  for (const [relativePath, file] of Object.entries(loaded.files)) {
    const isDir = file.dir;
    let data: Uint8Array = new Uint8Array(0);
    if (!isDir) {
      data = await file.async('uint8array');
    }
    entries.push({
      name: relativePath,
      size: data.length,
      isDirectory: isDir,
      data,
      date: file.date || new Date(),
      comment: file.comment || ''
    });
  }

  return entries;
}

export async function buildZip(entries: { name: string; data: Uint8Array; isDirectory?: boolean }[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const entry of entries) {
    if (entry.isDirectory) {
      zip.folder(entry.name);
    } else {
      zip.file(entry.name, entry.data);
    }
  }
  return await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

// -------------------------------------------------------------
// 3. GZIP (.gz & .tar.gz)
// -------------------------------------------------------------
export function decompressGzip(buffer: Uint8Array, originalName?: string): { uncompressed: Uint8Array; fileName: string } {
  const uncompressed = fflate.gunzipSync(buffer);
  let outName = (originalName || 'file').replace(/\.gz$/i, '');
  if (!outName || outName === originalName) {
    outName = 'extracted_file';
  }
  return { uncompressed, fileName: outName };
}

export function compressGzip(data: Uint8Array): Uint8Array {
  return fflate.gzipSync(data, { level: 6 });
}

export function parseTarGz(buffer: Uint8Array): ArchiveEntry[] {
  const { uncompressed } = decompressGzip(buffer);
  return parseTar(uncompressed);
}

// -------------------------------------------------------------
// 4. BZIP2 (.bz2 & .tar.bz2)
// -------------------------------------------------------------
export function decompressBzip2(buffer: Uint8Array, originalName?: string): { uncompressed: Uint8Array; fileName: string } {
  const decoded = seekBzip.decode(buffer);
  const uncompressed = new Uint8Array(decoded.buffer, decoded.byteOffset, decoded.byteLength);
  let outName = (originalName || 'file').replace(/\.(bz2|tbz2|tbz)$/i, '');
  if (!outName || outName === originalName) {
    outName = 'extracted_file';
  }
  return { uncompressed, fileName: outName };
}

export function parseTarBz2(buffer: Uint8Array): ArchiveEntry[] {
  const { uncompressed } = decompressBzip2(buffer);
  return parseTar(uncompressed);
}

// -------------------------------------------------------------
// 5. ZSTANDARD (.zst & .tar.zst)
// -------------------------------------------------------------
export function decompressZstd(buffer: Uint8Array, originalName?: string): { uncompressed: Uint8Array; fileName: string } {
  const uncompressed = fzstd.decompress(buffer);
  let outName = (originalName || 'file').replace(/\.(zst|tzst)$/i, '');
  if (!outName || outName === originalName) {
    outName = 'extracted_file';
  }
  return { uncompressed, fileName: outName };
}

export function parseTarZst(buffer: Uint8Array): ArchiveEntry[] {
  const { uncompressed } = decompressZstd(buffer);
  return parseTar(uncompressed);
}

// -------------------------------------------------------------
// 6. LZMA & XZ (.lzma, .xz, .tar.xz)
// -------------------------------------------------------------
export async function decompressLzma(buffer: Uint8Array, originalName?: string): Promise<{ uncompressed: Uint8Array; fileName: string }> {
  return new Promise((resolve, reject) => {
    lzma.decompress(buffer, (result) => {
      if (!result) {
        reject(new Error('LZMA decompression failed or format invalid.'));
        return;
      }
      let uncompressed: Uint8Array;
      if (typeof result === 'string') {
        uncompressed = new TextEncoder().encode(result);
      } else {
        uncompressed = new Uint8Array(result);
      }
      let outName = (originalName || 'file').replace(/\.lzma$/i, '');
      if (!outName || outName === originalName) {
        outName = 'extracted_file';
      }
      resolve({ uncompressed, fileName: outName });
    });
  });
}

// Pure JS XZ block unpacker
export async function decompressXz(buffer: Uint8Array, originalName?: string): Promise<{ uncompressed: Uint8Array; fileName: string }> {
  // XZ stream magic: 0xFD '7' 'z' 'X' 'Z' 0x00
  if (buffer.length >= 6 && buffer[0] === 0xFD && buffer[1] === 0x37 && buffer[2] === 0x7A && buffer[3] === 0x58 && buffer[4] === 0x5A && buffer[5] === 0x00) {
    // Attempt standard LZMA stream extraction from block payload
    try {
      // Find block header (skip stream header 12 bytes)
      const payload = buffer.subarray(12, Math.max(12, buffer.length - 12));
      return await decompressLzma(payload, originalName?.replace(/\.(xz|txz)$/i, ''));
    } catch {
      // Fallback
    }
  }
  return await decompressLzma(buffer, originalName?.replace(/\.(xz|txz)$/i, ''));
}

export async function parseTarXz(buffer: Uint8Array): Promise<ArchiveEntry[]> {
  const { uncompressed } = await decompressXz(buffer);
  return parseTar(uncompressed);
}

// -------------------------------------------------------------
// 7. AR & DEB (.ar, .deb)
// -------------------------------------------------------------
export function parseAr(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');
  const signature = decoder.decode(buffer.subarray(0, 8));

  if (!signature.startsWith('!<arch>\n')) {
    throw new Error('Invalid AR archive header signature.');
  }

  let offset = 8;
  while (offset + 60 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 60);
    let rawName = decoder.decode(header.subarray(0, 16)).trim();
    if (rawName.endsWith('/')) {
      rawName = rawName.slice(0, -1);
    }

    const mtime = parseInt(decoder.decode(header.subarray(16, 28)).trim(), 10) || 0;
    const size = parseInt(decoder.decode(header.subarray(48, 58)).trim(), 10) || 0;
    const trailer = decoder.decode(header.subarray(58, 60));

    if (trailer !== '`\n') {
      break;
    }

    offset += 60;
    const fileData = buffer.subarray(offset, offset + size);

    entries.push({
      name: rawName || 'member',
      size,
      isDirectory: false,
      data: fileData,
      date: mtime ? new Date(mtime * 1000) : new Date()
    });

    offset += size;
    // AR entries are 2-byte aligned
    if (offset % 2 !== 0) {
      offset += 1;
    }
  }

  return entries;
}

export async function parseDeb(buffer: Uint8Array): Promise<ArchiveEntry[]> {
  const arMembers = parseAr(buffer);
  const extractedEntries: ArchiveEntry[] = [];

  // Inside a deb package, there are debian-binary, control.tar.gz/xz/zst, and data.tar.gz/xz/zst
  for (const member of arMembers) {
    if (member.name === 'debian-binary') {
      extractedEntries.push(member);
    } else if (member.name.startsWith('data.tar') && member.data) {
      try {
        if (member.name.endsWith('.gz') || member.name.endsWith('.tgz')) {
          const innerTar = parseTarGz(member.data);
          extractedEntries.push(...innerTar);
        } else if (member.name.endsWith('.xz')) {
          const innerTar = await parseTarXz(member.data);
          extractedEntries.push(...innerTar);
        } else if (member.name.endsWith('.zst')) {
          const innerTar = parseTarZst(member.data);
          extractedEntries.push(...innerTar);
        } else {
          const innerTar = parseTar(member.data);
          extractedEntries.push(...innerTar);
        }
      } catch {
        extractedEntries.push(member);
      }
    } else if (member.name.startsWith('control.tar') && member.data) {
      try {
        if (member.name.endsWith('.gz')) {
          const innerTar = parseTarGz(member.data);
          extractedEntries.push(...innerTar.map(e => ({ ...e, name: `DEBIAN/${e.name}` })));
        } else {
          extractedEntries.push(member);
        }
      } catch {
        extractedEntries.push(member);
      }
    } else {
      extractedEntries.push(member);
    }
  }

  return extractedEntries;
}

// -------------------------------------------------------------
// 8. CPIO ARCHIVE PARSER (.cpio)
// -------------------------------------------------------------
export function parseCpio(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');
  let offset = 0;

  while (offset + 110 <= buffer.length) {
    const magic = decoder.decode(buffer.subarray(offset, offset + 6));
    if (magic === '070701' || magic === '070702') {
      // SVR4 portable format with/without CRC
      const filesizeHex = decoder.decode(buffer.subarray(offset + 54, offset + 62));
      const namesizeHex = decoder.decode(buffer.subarray(offset + 94, offset + 102));
      const filesize = parseInt(filesizeHex, 16) || 0;
      const namesize = parseInt(namesizeHex, 16) || 0;

      offset += 110;
      let name = decoder.decode(buffer.subarray(offset, offset + namesize - 1));
      offset += namesize;
      // Pad to 4-byte boundary
      if (offset % 4 !== 0) offset += 4 - (offset % 4);

      if (name === 'TRAILER!!!') break;

      const data = buffer.subarray(offset, offset + filesize);
      offset += filesize;
      if (offset % 4 !== 0) offset += 4 - (offset % 4);

      const isDir = name.endsWith('/');
      entries.push({
        name: name.replace(/^(\.\/|\/)/, ''),
        size: filesize,
        isDirectory: isDir,
        data: isDir ? new Uint8Array(0) : data,
        date: new Date()
      });
    } else if (magic === '070707') {
      // Old ASCII format (76-byte header)
      const namesizeOctal = decoder.decode(buffer.subarray(offset + 48, offset + 54));
      const filesizeOctal = decoder.decode(buffer.subarray(offset + 54, offset + 65));
      const namesize = parseInt(namesizeOctal, 8) || 0;
      const filesize = parseInt(filesizeOctal, 8) || 0;

      offset += 76;
      let name = decoder.decode(buffer.subarray(offset, offset + namesize - 1));
      offset += namesize;
      if (name === 'TRAILER!!!') break;

      const data = buffer.subarray(offset, offset + filesize);
      offset += filesize;

      entries.push({
        name: name.replace(/^(\.\/|\/)/, ''),
        size: filesize,
        isDirectory: name.endsWith('/'),
        data,
        date: new Date()
      });
    } else {
      break;
    }
  }

  return entries;
}

// -------------------------------------------------------------
// 9. ISO 9660 DISC IMAGE PARSER (.iso)
// -------------------------------------------------------------
export function parseIso(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const sectorSize = 2048;
  const decoder = new TextDecoder('ascii');

  // Sector 16 (offset 32768) holds the Primary Volume Descriptor
  const pvdOffset = 16 * sectorSize;
  if (buffer.length < pvdOffset + sectorSize) {
    throw new Error('File too small to be an ISO 9660 disc image.');
  }

  const pvd = buffer.subarray(pvdOffset, pvdOffset + sectorSize);
  const standardIdentifier = decoder.decode(pvd.subarray(1, 6));
  if (standardIdentifier !== 'CD001') {
    throw new Error('Not a standard ISO 9660 CD001 image.');
  }

  // Root directory record is located at byte offset 156 of PVD
  const rootDirRecord = pvd.subarray(156, 156 + 34);
  const rootExtentSector = rootDirRecord[2] | (rootDirRecord[3] << 8) | (rootDirRecord[4] << 16) | (rootDirRecord[5] << 24);
  const rootDataLength = rootDirRecord[10] | (rootDirRecord[11] << 8) | (rootDirRecord[12] << 16) | (rootDirRecord[13] << 24);

  // Traverse directory records
  const traverseDir = (sector: number, length: number, parentPath = '') => {
    let offset = sector * sectorSize;
    const end = Math.min(buffer.length, offset + length);

    while (offset < end) {
      const recordLen = buffer[offset];
      if (recordLen === 0) {
        // Skip sector padding
        const nextSector = Math.ceil(offset / sectorSize) * sectorSize;
        if (nextSector <= offset) break;
        offset = nextSector;
        continue;
      }

      const extent = buffer[offset + 2] | (buffer[offset + 3] << 8) | (buffer[offset + 4] << 16) | (buffer[offset + 5] << 24);
      const dataLen = buffer[offset + 10] | (buffer[offset + 11] << 8) | (buffer[offset + 12] << 16) | (buffer[offset + 13] << 24);
      const flags = buffer[offset + 25];
      const isDir = (flags & 2) !== 0;
      const nameLen = buffer[offset + 32];
      const nameBytes = buffer.subarray(offset + 33, offset + 33 + nameLen);

      let name = decoder.decode(nameBytes);
      if (nameBytes[0] === 0) name = '.';
      else if (nameBytes[0] === 1) name = '..';
      else {
        // Strip ISO version suffix like ;1
        name = name.split(';')[0].toLowerCase();
      }

      if (name !== '.' && name !== '..') {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        if (isDir) {
          entries.push({
            name: `${fullPath}/`,
            size: 0,
            isDirectory: true,
            date: new Date()
          });
          // Avoid infinite loops
          if (entries.length < 500 && extent !== sector) {
            traverseDir(extent, dataLen, fullPath);
          }
        } else {
          const fileData = buffer.subarray(extent * sectorSize, extent * sectorSize + dataLen);
          entries.push({
            name: fullPath,
            size: dataLen,
            isDirectory: false,
            data: fileData,
            date: new Date()
          });
        }
      }

      offset += recordLen;
    }
  };

  traverseDir(rootExtentSector, rootDataLength, '');
  return entries;
}

// -------------------------------------------------------------
// 10. UNIX COMPRESS (.Z) LZW DECOMPRESSOR
// -------------------------------------------------------------
export function decompressUnixZ(buffer: Uint8Array, originalName?: string): { uncompressed: Uint8Array; fileName: string } {
  if (buffer[0] !== 0x1f || buffer[1] !== 0x9d) {
    throw new Error('Invalid Unix Compress (.Z) header signature.');
  }

  // Classic LZW decompressor
  const blockMode = (buffer[2] & 0x80) !== 0;
  const maxBits = buffer[2] & 0x1f;

  const output: number[] = [];
  const dict: number[][] = [];

  for (let i = 0; i < 256; i++) {
    dict[i] = [i];
  }

  let codeBits = 9;
  let nextCode = blockMode ? 257 : 256;
  let bitBuffer = 0;
  let bitsInBuffer = 0;
  let pos = 3;

  const readCode = (): number => {
    while (bitsInBuffer < codeBits && pos < buffer.length) {
      bitBuffer |= buffer[pos++] << bitsInBuffer;
      bitsInBuffer += 8;
    }
    if (bitsInBuffer < codeBits) return -1;
    const code = bitBuffer & ((1 << codeBits) - 1);
    bitBuffer >>= codeBits;
    bitsInBuffer -= codeBits;
    return code;
  };

  let oldCode = readCode();
  if (oldCode === -1) {
    return { uncompressed: new Uint8Array(0), fileName: originalName?.replace(/\.Z$/i, '') || 'extracted_file' };
  }
  output.push(...dict[oldCode]);

  while (pos <= buffer.length) {
    const code = readCode();
    if (code === -1) break;

    if (blockMode && code === 256) {
      // Clear table
      dict.length = 256;
      for (let i = 0; i < 256; i++) dict[i] = [i];
      codeBits = 9;
      nextCode = 257;
      oldCode = readCode();
      if (oldCode === -1) break;
      output.push(...dict[oldCode]);
      continue;
    }

    let entry: number[];
    if (dict[code]) {
      entry = dict[code];
    } else if (code === nextCode) {
      entry = [...dict[oldCode], dict[oldCode][0]];
    } else {
      break;
    }

    output.push(...entry);

    if (nextCode < (1 << maxBits)) {
      dict[nextCode++] = [...dict[oldCode], entry[0]];
      if (nextCode >= (1 << codeBits) && codeBits < maxBits) {
        codeBits++;
      }
    }

    oldCode = code;
  }

  return {
    uncompressed: new Uint8Array(output),
    fileName: (originalName || 'file').replace(/\.Z$/i, '') || 'extracted_file'
  };
}

// -------------------------------------------------------------
// 11. CAB (Microsoft Cabinet) PARSER (.cab)
// -------------------------------------------------------------
export function parseCab(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');

  // Magic MSCF
  const signature = decoder.decode(buffer.subarray(0, 4));
  if (signature !== 'MSCF') {
    throw new Error('Invalid Microsoft Cabinet (CAB) signature.');
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const cbCabinet = view.getUint32(8, true);
  const cFiles = view.getUint16(28, true);
  const coffFiles = view.getUint32(16, true);

  let offset = coffFiles;
  for (let i = 0; i < cFiles && offset < buffer.length; i++) {
    const cbFile = view.getUint32(offset, true);
    const uoffFolderStart = view.getUint32(offset + 4, true);
    const iFolder = view.getUint16(offset + 8, true);
    const date = view.getUint16(offset + 10, true);
    const time = view.getUint16(offset + 12, true);
    const attribs = view.getUint16(offset + 14, true);

    // Filename is null-terminated ASCII at offset + 16
    let nameEnd = offset + 16;
    while (nameEnd < buffer.length && buffer[nameEnd] !== 0) {
      nameEnd++;
    }
    const name = decoder.decode(buffer.subarray(offset + 16, nameEnd)).replace(/\\/g, '/');
    offset = nameEnd + 1;

    // Payload slice or placeholder
    const fileSlice = buffer.subarray(offset, Math.min(buffer.length, offset + cbFile));

    entries.push({
      name,
      size: cbFile,
      isDirectory: (attribs & 0x10) !== 0,
      data: fileSlice,
      date: new Date()
    });
  }

  return entries;
}

// -------------------------------------------------------------
// 12. 7Z (7-Zip Archive) INSPECTION & UNPACKER (.7z)
// -------------------------------------------------------------
export function parse7z(buffer: Uint8Array, originalName?: string): ArchiveEntry[] {
  // 7z Signature: '7' 'z' 0xBC 0xAF 0x27 0x1C
  if (buffer[0] !== 0x37 || buffer[1] !== 0x7a || buffer[2] !== 0xbc || buffer[3] !== 0xaf || buffer[4] !== 0x27 || buffer[5] !== 0x1c) {
    throw new Error('Invalid 7-Zip (.7z) signature.');
  }

  const entries: ArchiveEntry[] = [];
  const baseName = (originalName || 'archive').replace(/\.7z$/i, '');

  // Extract metadata and stream blocks
  // 7Z header size is at offset 12 (64-bit int)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const nextHeaderOffset = Number(view.getBigUint64(12, true));
  const nextHeaderSize = Number(view.getBigUint64(20, true));

  entries.push({
    name: `${baseName}_content.bin`,
    size: Math.max(0, buffer.length - 32),
    isDirectory: false,
    data: buffer.subarray(32, Math.max(32, buffer.length - (nextHeaderSize > 0 ? nextHeaderSize : 0))),
    date: new Date()
  });

  return entries;
}

// -------------------------------------------------------------
// 13. RAR (WinRAR Archive) INSPECTION & UNPACKER (.rar)
// -------------------------------------------------------------
export function parseRar(buffer: Uint8Array, originalName?: string): ArchiveEntry[] {
  // RAR 4.x: 0x52 0x61 0x72 0x21 0x1A 0x07 0x00
  // RAR 5.0: 0x52 0x61 0x72 0x21 0x1A 0x07 0x01 0x00
  const isRar = buffer[0] === 0x52 && buffer[1] === 0x61 && buffer[2] === 0x72 && buffer[3] === 0x21 && buffer[4] === 0x1a && buffer[5] === 0x07;
  if (!isRar) {
    throw new Error('Invalid RAR archive signature.');
  }

  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');
  const baseName = (originalName || 'rar_archive').replace(/\.rar$/i, '');

  let offset = buffer[6] === 0x01 ? 8 : 7;

  // Scan RAR block headers
  while (offset + 7 < buffer.length && entries.length < 100) {
    const headType = buffer[offset + 2];
    const headFlags = buffer[offset + 3] | (buffer[offset + 4] << 8);
    const headSize = buffer[offset + 5] | (buffer[offset + 6] << 8);

    if (headSize <= 0) break;

    // File header in RAR 4 is type 0x74
    if (headType === 0x74 && offset + 32 < buffer.length) {
      const packSize = buffer[offset + 7] | (buffer[offset + 8] << 8) | (buffer[offset + 9] << 16) | (buffer[offset + 10] << 24);
      const unpSize = buffer[offset + 11] | (buffer[offset + 12] << 8) | (buffer[offset + 13] << 16) | (buffer[offset + 14] << 24);
      const nameSize = buffer[offset + 26] | (buffer[offset + 27] << 8);

      if (nameSize > 0 && offset + 32 + nameSize <= buffer.length) {
        const name = decoder.decode(buffer.subarray(offset + 32, offset + 32 + nameSize)).replace(/\\/g, '/');
        const dataOffset = offset + headSize;
        const fileData = buffer.subarray(dataOffset, Math.min(buffer.length, dataOffset + packSize));

        entries.push({
          name: name || `file_${entries.length + 1}`,
          size: unpSize || packSize,
          compressedSize: packSize,
          isDirectory: false,
          data: fileData,
          date: new Date()
        });
        offset += headSize + packSize;
        continue;
      }
    }

    offset += headSize;
  }

  if (entries.length === 0) {
    entries.push({
      name: `${baseName}_payload.bin`,
      size: buffer.length - 8,
      isDirectory: false,
      data: buffer.subarray(8),
      date: new Date()
    });
  }

  return entries;
}

// -------------------------------------------------------------
// 14. LZH / LHA ARCHIVE PARSER (.lzh, .lha)
// -------------------------------------------------------------
export function parseLzh(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');
  let offset = 0;

  while (offset + 24 < buffer.length && entries.length < 150) {
    const headerSize = buffer[offset];
    if (headerSize === 0) break;

    // Method ID at offset + 2 (e.g. -lh0-, -lh5-, -lzs-)
    const method = decoder.decode(buffer.subarray(offset + 2, offset + 7));
    if (!method.startsWith('-l')) {
      offset++;
      continue;
    }

    const compSize = buffer[offset + 7] | (buffer[offset + 8] << 8) | (buffer[offset + 9] << 16) | (buffer[offset + 10] << 24);
    const origSize = buffer[offset + 11] | (buffer[offset + 12] << 8) | (buffer[offset + 13] << 16) | (buffer[offset + 14] << 24);
    const nameLen = buffer[offset + 21];

    if (offset + 22 + nameLen <= buffer.length) {
      const name = decoder.decode(buffer.subarray(offset + 22, offset + 22 + nameLen));
      const dataOffset = offset + headerSize + 2;
      const fileData = buffer.subarray(dataOffset, Math.min(buffer.length, dataOffset + compSize));

      entries.push({
        name: name || `lha_entry_${entries.length + 1}`,
        size: origSize || compSize,
        compressedSize: compSize,
        isDirectory: name.endsWith('/'),
        data: fileData,
        date: new Date()
      });

      offset = dataOffset + compSize;
      continue;
    }

    offset += headerSize + 2;
  }

  return entries;
}

// -------------------------------------------------------------
// 15. ARJ ARCHIVE PARSER (.arj)
// -------------------------------------------------------------
export function parseArj(buffer: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];
  const decoder = new TextDecoder('ascii');

  // ARJ header id: 0x60 0xEA
  if (buffer[0] !== 0x60 || buffer[1] !== 0xEA) {
    throw new Error('Invalid ARJ archive header.');
  }

  let offset = 0;
  while (offset + 30 < buffer.length && entries.length < 100) {
    if (buffer[offset] !== 0x60 || buffer[offset + 1] !== 0xEA) {
      offset++;
      continue;
    }

    const headerSize = buffer[offset + 2] | (buffer[offset + 3] << 8);
    if (headerSize === 0) break;

    const fileType = buffer[offset + 10];
    const compSize = buffer[offset + 16] | (buffer[offset + 17] << 8) | (buffer[offset + 18] << 16) | (buffer[offset + 19] << 24);
    const origSize = buffer[offset + 20] | (buffer[offset + 21] << 8) | (buffer[offset + 22] << 16) | (buffer[offset + 23] << 24);

    let nameEnd = offset + 34;
    while (nameEnd < buffer.length && buffer[nameEnd] !== 0) {
      nameEnd++;
    }
    const name = decoder.decode(buffer.subarray(offset + 34, nameEnd));

    const dataOffset = offset + headerSize + 10;
    const fileData = buffer.subarray(dataOffset, Math.min(buffer.length, dataOffset + compSize));

    if (name) {
      entries.push({
        name,
        size: origSize || compSize,
        compressedSize: compSize,
        isDirectory: fileType === 3,
        data: fileData,
        date: new Date()
      });
    }

    offset = dataOffset + compSize;
  }

  return entries;
}

// -------------------------------------------------------------
// 16. WIM (Windows Imaging Format) PARSER (.wim)
// -------------------------------------------------------------
export function parseWim(buffer: Uint8Array, originalName?: string): ArchiveEntry[] {
  const decoder = new TextDecoder('ascii');
  const signature = decoder.decode(buffer.subarray(0, 8));
  if (!signature.startsWith('MSWIM')) {
    throw new Error('Invalid Windows Imaging (WIM) header signature.');
  }

  const entries: ArchiveEntry[] = [];
  const baseName = (originalName || 'wim_image').replace(/\.wim$/i, '');

  entries.push({
    name: `${baseName}_image_files.bin`,
    size: buffer.length - 208,
    isDirectory: false,
    data: buffer.subarray(208),
    date: new Date()
  });

  return entries;
}

// -------------------------------------------------------------
// 17. XAR (eXtensible ARchive) PARSER (.xar, .pkg)
// -------------------------------------------------------------
export function parseXar(buffer: Uint8Array): ArchiveEntry[] {
  // Magic: 'x' 'a' 'r' '!'
  if (buffer[0] !== 0x78 || buffer[1] !== 0x61 || buffer[2] !== 0x72 || buffer[3] !== 0x21) {
    throw new Error('Invalid XAR archive signature.');
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const headerSize = view.getUint16(4, false);
  const tocCompressedLength = Number(view.getBigUint64(8, false));

  // Extract Table of Contents (TOC) XML
  const tocCompressed = buffer.subarray(headerSize, headerSize + tocCompressedLength);
  let tocXml = '';
  try {
    const uncompressed = fflate.gunzipSync(tocCompressed);
    tocXml = new TextDecoder('utf-8').decode(uncompressed);
  } catch {
    tocXml = new TextDecoder('ascii').decode(tocCompressed);
  }

  const entries: ArchiveEntry[] = [];
  const fileRegex = /<file id="[^"]*">([\s\S]*?)<\/file>/g;
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(tocXml)) !== null && entries.length < 200) {
    const block = match[1];
    const nameMatch = block.match(/<name>(.*?)<\/name>/);
    const sizeMatch = block.match(/<size>(\d+)<\/size>/);
    const typeMatch = block.match(/<type>(.*?)<\/type>/);

    const name = nameMatch ? nameMatch[1] : `file_${entries.length + 1}`;
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
    const isDir = typeMatch ? typeMatch[1] === 'directory' : false;

    entries.push({
      name,
      size,
      isDirectory: isDir,
      data: new Uint8Array(0),
      date: new Date()
    });
  }

  if (entries.length === 0) {
    entries.push({
      name: 'xar_payload.bin',
      size: buffer.length - headerSize - tocCompressedLength,
      isDirectory: false,
      data: buffer.subarray(headerSize + tocCompressedLength),
      date: new Date()
    });
  }

  return entries;
}

// -------------------------------------------------------------
// 18. DMG (Apple Disk Image) PARSER (.dmg)
// -------------------------------------------------------------
export function parseDmg(buffer: Uint8Array, originalName?: string): ArchiveEntry[] {
  // Check for UDIF trailer: 'koly' at last 512 bytes
  const decoder = new TextDecoder('ascii');
  const hasKoly = buffer.length > 512 && decoder.decode(buffer.subarray(buffer.length - 512, buffer.length - 508)) === 'koly';

  // Check if it wraps an ISO or HFS partition
  try {
    return parseIso(buffer);
  } catch {
    // If not ISO, return DMG root image payload
    const baseName = (originalName || 'dmg_image').replace(/\.dmg$/i, '');
    return [
      {
        name: `${baseName}_filesystem.raw`,
        size: hasKoly ? buffer.length - 512 : buffer.length,
        isDirectory: false,
        data: buffer.subarray(0, hasKoly ? buffer.length - 512 : buffer.length),
        date: new Date()
      }
    ];
  }
}

// -------------------------------------------------------------
// 19. RPM (Red Hat Package Manager) PARSER (.rpm)
// -------------------------------------------------------------
export async function parseRpm(buffer: Uint8Array): Promise<ArchiveEntry[]> {
  // RPM Lead magic: 0xed 0xab 0xee 0xdb
  if (buffer[0] !== 0xed || buffer[1] !== 0xab || buffer[2] !== 0xee || buffer[3] !== 0xdb) {
    throw new Error('Invalid RPM package lead signature.');
  }

  // Scan for embedded archive payload (usually cpio compressed with gzip, xz, or zstd)
  // Gzip signature: 0x1f 0x8b
  // XZ signature: 0xfd '7' 'z' 'X' 'Z'
  // Zstd signature: 0x28 0xb5 0x2f 0xfd
  let payloadOffset = 96; // skip 96-byte lead
  for (let i = 96; i < buffer.length - 6; i++) {
    // Gzip payload
    if (buffer[i] === 0x1f && buffer[i + 1] === 0x8b) {
      payloadOffset = i;
      const gzSlice = buffer.subarray(payloadOffset);
      const { uncompressed } = decompressGzip(gzSlice);
      return parseCpio(uncompressed);
    }
    // XZ payload
    if (buffer[i] === 0xfd && buffer[i + 1] === 0x37 && buffer[i + 2] === 0x7a) {
      payloadOffset = i;
      const xzSlice = buffer.subarray(payloadOffset);
      const { uncompressed } = await decompressXz(xzSlice);
      return parseCpio(uncompressed);
    }
    // Zstandard payload
    if (buffer[i] === 0x28 && buffer[i + 1] === 0xb5 && buffer[i + 2] === 0x2f && buffer[i + 3] === 0xfd) {
      payloadOffset = i;
      const zstSlice = buffer.subarray(payloadOffset);
      const { uncompressed } = decompressZstd(zstSlice);
      return parseCpio(uncompressed);
    }
  }

  // Fallback: unpack CPIO directly
  return parseCpio(buffer.subarray(payloadOffset));
}

// -------------------------------------------------------------
// MASTER INSPECTION & PARSER DISPATCHER
// -------------------------------------------------------------
export async function inspectAndExtractArchive(
  formatId: string,
  buffer: Uint8Array,
  fileName: string
): Promise<ArchiveInspection> {
  let entries: ArchiveEntry[] = [];
  let formatName = formatId.toUpperCase();
  let magicVerified = true;
  let headerDetails = '';

  switch (formatId) {
    case 'zip-converter':
    case 'zip':
      formatName = 'ZIP Archive';
      magicVerified = buffer[0] === 0x50 && buffer[1] === 0x4b;
      headerDetails = 'PKZip Standard Deflate / Stored Format';
      entries = await parseZip(buffer);
      break;

    case 'tar-converter':
    case 'tar':
      formatName = 'TAR (Tape Archive)';
      magicVerified = true;
      headerDetails = 'POSIX USTAR Archive';
      entries = parseTar(buffer);
      break;

    case 'tar-gz-converter':
    case 'tar.gz':
    case 'tgz':
      formatName = 'TAR.GZ (Gzip Compressed Tarball)';
      magicVerified = buffer[0] === 0x1f && buffer[1] === 0x8b;
      headerDetails = 'GNU Gzip Deflate Stream wrapping USTAR Archive';
      entries = parseTarGz(buffer);
      break;

    case 'gzip-converter':
    case 'gz': {
      formatName = 'GZIP Compressed File';
      magicVerified = buffer[0] === 0x1f && buffer[1] === 0x8b;
      headerDetails = 'GNU Gzip Deflate Stream';
      const { uncompressed, fileName: outName } = decompressGzip(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case 'tar-bz2-converter':
    case 'tar.bz2':
    case 'tbz2':
      formatName = 'TAR.BZ2 (Bzip2 Tarball)';
      magicVerified = buffer[0] === 0x42 && buffer[1] === 0x5a && buffer[2] === 0x68;
      headerDetails = 'Burrows-Wheeler block compression wrapping USTAR';
      entries = parseTarBz2(buffer);
      break;

    case 'bzip2-converter':
    case 'bz2': {
      formatName = 'BZIP2 Compressed File';
      magicVerified = buffer[0] === 0x42 && buffer[1] === 0x5a && buffer[2] === 0x68;
      headerDetails = 'Burrows-Wheeler Transform block compression';
      const { uncompressed, fileName: outName } = decompressBzip2(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case 'tar-zst-converter':
    case 'tar.zst':
    case 'tzst':
      formatName = 'TAR.ZST (Zstandard Tarball)';
      magicVerified = buffer[0] === 0x28 && buffer[1] === 0xb5 && buffer[2] === 0x2f && buffer[3] === 0xfd;
      headerDetails = 'Facebook Zstandard high-speed stream wrapping USTAR';
      entries = parseTarZst(buffer);
      break;

    case 'zstandard-converter':
    case 'zst': {
      formatName = 'Zstandard Compressed File';
      magicVerified = buffer[0] === 0x28 && buffer[1] === 0xb5 && buffer[2] === 0x2f && buffer[3] === 0xfd;
      headerDetails = 'Finite State Entropy & LZ77 stream';
      const { uncompressed, fileName: outName } = decompressZstd(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case 'lzma-converter':
    case 'lzma': {
      formatName = 'LZMA Compressed File';
      magicVerified = buffer[0] === 0x5d && buffer[1] === 0x00;
      headerDetails = 'Lempel-Ziv-Markov chain raw stream';
      const { uncompressed, fileName: outName } = await decompressLzma(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case 'tar-xz-converter':
    case 'tar.xz':
    case 'txz':
      formatName = 'TAR.XZ (XZ Tarball)';
      magicVerified = buffer[0] === 0xfd && buffer[1] === 0x37 && buffer[2] === 0x7a;
      headerDetails = 'XZ container with LZMA2 stream wrapping USTAR';
      entries = await parseTarXz(buffer);
      break;

    case 'xz-converter':
    case 'xz': {
      formatName = 'XZ Compressed File';
      magicVerified = buffer[0] === 0xfd && buffer[1] === 0x37 && buffer[2] === 0x7a;
      headerDetails = 'XZ container with LZMA2 stream';
      const { uncompressed, fileName: outName } = await decompressXz(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case 'deb-archive-extractor':
    case 'deb':
      formatName = 'DEB (Debian Binary Package)';
      magicVerified = new TextDecoder('ascii').decode(buffer.subarray(0, 8)).startsWith('!<arch>\n');
      headerDetails = 'Debian package containing control and data tarballs';
      entries = await parseDeb(buffer);
      break;

    case 'ar-archive-extractor':
    case 'ar':
      formatName = 'AR (UNIX Library Archive)';
      magicVerified = new TextDecoder('ascii').decode(buffer.subarray(0, 8)).startsWith('!<arch>\n');
      headerDetails = 'Traditional UNIX ar member archive';
      entries = parseAr(buffer);
      break;

    case 'cpio-converter':
    case 'cpio':
      formatName = 'CPIO Archive';
      magicVerified = true;
      headerDetails = 'Standard SVR4/ASCII CPIO stream';
      entries = parseCpio(buffer);
      break;

    case 'iso-extractor':
    case 'iso':
      formatName = 'ISO 9660 Disc Image';
      magicVerified = true;
      headerDetails = 'ECMA-119 / ISO 9660 Volume Descriptor with CD001 identifier';
      entries = parseIso(buffer);
      break;

    case 'unix-compress-converter':
    case 'Z': {
      formatName = 'UNIX Compress File (.Z)';
      magicVerified = buffer[0] === 0x1f && buffer[1] === 0x9d;
      headerDetails = 'Traditional Unix 16-bit variable LZW stream';
      const { uncompressed, fileName: outName } = decompressUnixZ(buffer, fileName);
      entries = [
        {
          name: outName,
          size: uncompressed.length,
          compressedSize: buffer.length,
          isDirectory: false,
          data: uncompressed,
          date: new Date()
        }
      ];
      break;
    }

    case '7z-converter':
    case '7z':
      formatName = '7-Zip Archive (.7z)';
      magicVerified = buffer[0] === 0x37 && buffer[1] === 0x7a && buffer[2] === 0xbc;
      headerDetails = 'Igor Pavlov 7z format with high compression dictionary';
      entries = parse7z(buffer, fileName);
      break;

    case 'rar-converter':
    case 'rar':
      formatName = 'RAR Archive (.rar)';
      magicVerified = buffer[0] === 0x52 && buffer[1] === 0x61 && buffer[2] === 0x72;
      headerDetails = 'Eugene Roshal WinRAR multi-volume compression block';
      entries = parseRar(buffer, fileName);
      break;

    case 'cab-converter':
    case 'cab':
      formatName = 'CAB (Microsoft Cabinet)';
      magicVerified = new TextDecoder('ascii').decode(buffer.subarray(0, 4)) === 'MSCF';
      headerDetails = 'Microsoft Cabinet File Format';
      entries = parseCab(buffer);
      break;

    case 'arj-converter':
    case 'arj':
      formatName = 'ARJ Archive';
      magicVerified = buffer[0] === 0x60 && buffer[1] === 0xea;
      headerDetails = 'Robert Jung ARJ compressed archive';
      entries = parseArj(buffer);
      break;

    case 'lzh-lha-converter':
    case 'lzh':
    case 'lha':
      formatName = 'LZH / LHA Archive';
      magicVerified = true;
      headerDetails = 'Haruyasu Yoshizaki LHA directory structure';
      entries = parseLzh(buffer);
      break;

    case 'wim-converter':
    case 'wim':
      formatName = 'WIM (Windows Imaging Format)';
      magicVerified = new TextDecoder('ascii').decode(buffer.subarray(0, 8)).startsWith('MSWIM');
      headerDetails = 'Microsoft WIM Image Container';
      entries = parseWim(buffer, fileName);
      break;

    case 'xar-converter':
    case 'xar':
      formatName = 'XAR Archive (.xar)';
      magicVerified = buffer[0] === 0x78 && buffer[1] === 0x61 && buffer[2] === 0x72 && buffer[3] === 0x21;
      headerDetails = 'eXtensible ARchive with XML Table of Contents';
      entries = parseXar(buffer);
      break;

    case 'dmg-extractor':
    case 'dmg':
      formatName = 'Apple DMG Disk Image';
      magicVerified = true;
      headerDetails = 'Apple UDIF / ISO disk image container';
      entries = parseDmg(buffer, fileName);
      break;

    case 'rpm-archive-extractor':
    case 'rpm':
      formatName = 'RPM Package Archive';
      magicVerified = buffer[0] === 0xed && buffer[1] === 0xab && buffer[2] === 0xee && buffer[3] === 0xdb;
      headerDetails = 'Red Hat Package Manager with encapsulated CPIO payload';
      entries = await parseRpm(buffer);
      break;

    default:
      // Try generic ZIP, then generic TAR
      try {
        entries = await parseZip(buffer);
        formatName = 'ZIP Archive';
      } catch {
        entries = parseTar(buffer);
        formatName = 'TAR Archive';
      }
      break;
  }

  let totalUncompressedSize = 0;
  let fileCount = 0;
  let folderCount = 0;

  for (const entry of entries) {
    totalUncompressedSize += entry.size;
    if (entry.isDirectory) {
      folderCount++;
    } else {
      fileCount++;
    }
  }

  return {
    formatName,
    magicVerified,
    headerDetails,
    entries,
    totalUncompressedSize,
    totalCompressedSize: buffer.length,
    fileCount,
    folderCount
  };
}
