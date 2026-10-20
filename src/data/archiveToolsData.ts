import { ArchiveToolConfig } from '../tools/archive/ArchiveConverterTool';

export const ARCHIVE_TOOLS_CONFIG: Record<string, ArchiveToolConfig> = {
  'zip-converter': {
    id: 'zip-converter',
    name: 'ZIP Converter & Extractor',
    shortDescription: 'Unpack, convert, and inspect standard PKZip archives. Convert ZIP to TAR, TAR.GZ, or extract files.',
    primaryExtension: '.zip',
    supportedExtensions: ['.zip', '.zipx'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'tar',
    availableTargets: ['tar', 'tar.gz'],
    technicalDetails: {
      formatSpecs: 'PKWARE PKZip specification with DEFLATE (RFC 1951)',
      compressionMethod: 'DEFLATE / Stored (Uncompressed)',
      typicalUseCases: ['Cross-platform file sharing', 'Email attachments', 'Software distribution', 'Web asset bundling'],
      magicBytes: '50 4B 03 04 (PK\\x03\\x04)'
    }
  },
  '7z-converter': {
    id: '7z-converter',
    name: '7Z Converter & Extractor',
    shortDescription: 'Extract and convert 7-Zip (.7z) high-compression archives directly to ZIP or uncompressed files.',
    primaryExtension: '.7z',
    supportedExtensions: ['.7z'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: '7-Zip open architecture with LZMA/LZMA2 algorithm',
      compressionMethod: 'LZMA, LZMA2, PPMd, BCJ2',
      typicalUseCases: ['High-ratio backups', 'Software releases', 'Gaming resource packs', 'Large dataset archival'],
      magicBytes: '37 7A BC AF 27 1C (7z\\xBC\\xAF)'
    }
  },
  'rar-converter': {
    id: 'rar-converter',
    name: 'RAR Converter & Extractor',
    shortDescription: 'Unpack WinRAR archives (.rar v4 & v5) and convert them to universal ZIP or TAR archives.',
    primaryExtension: '.rar',
    supportedExtensions: ['.rar'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Eugene Roshal RAR v4.x and RAR v5.0 container format',
      compressionMethod: 'Proprietary LZSS with Huffman coding and AES encryption',
      typicalUseCases: ['Multi-volume split archives', 'Media distribution', 'Legacy downloads', 'File backup archives'],
      magicBytes: '52 61 72 21 1A 07 00 (Rar!\\x1a\\x07)'
    }
  },
  'tar-converter': {
    id: 'tar-converter',
    name: 'TAR Converter & Packager',
    shortDescription: 'Unpack POSIX USTAR tape archives (.tar) and convert them to compressed ZIP, TAR.GZ, or raw files.',
    primaryExtension: '.tar',
    supportedExtensions: ['.tar'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar.gz'],
    technicalDetails: {
      formatSpecs: 'POSIX.1-1988 USTAR (Uniform Standard Tape Archive) and GNU tar',
      compressionMethod: 'Uncompressed sequential 512-byte block container',
      typicalUseCases: ['Linux system backups', 'Container filesystem images (Docker)', 'Source code distributions'],
      magicBytes: '75 73 74 61 72 (ustar at offset 257)'
    }
  },
  'tar-gz-converter': {
    id: 'tar-gz-converter',
    name: 'TAR.GZ Converter & Extractor',
    shortDescription: 'Extract and convert Gzip-compressed tarballs (.tar.gz, .tgz) into standard ZIP or uncompressed TAR.',
    primaryExtension: '.tar.gz',
    supportedExtensions: ['.tar.gz', '.tgz'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'POSIX USTAR sequential container inside RFC 1952 Gzip wrapper',
      compressionMethod: 'DEFLATE (Lempel-Ziv 1977 + Huffman coding)',
      typicalUseCases: ['Linux & Unix package distribution', 'NPM package tarballs (.tgz)', 'Server backup dumps'],
      magicBytes: '1F 8B 08 (Gzip Deflate)'
    }
  },
  'gzip-converter': {
    id: 'gzip-converter',
    name: 'GZIP Converter (.gz)',
    shortDescription: 'Decompress single-file .gz archives to original format (.sql, .txt, .csv) or compress files to GZIP.',
    primaryExtension: '.gz',
    supportedExtensions: ['.gz'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'RFC 1952 GZIP file format with CRC-32 integrity validation',
      compressionMethod: 'DEFLATE streaming algorithm',
      typicalUseCases: ['Web server HTTP compression (mod_gzip)', 'Database SQL dumps', 'Server log files (.log.gz)'],
      magicBytes: '1F 8B (Gzip Identifier)'
    }
  },
  'tar-bz2-converter': {
    id: 'tar-bz2-converter',
    name: 'TAR.BZ2 Converter & Extractor',
    shortDescription: 'Unpack Bzip2-compressed Linux tarballs (.tar.bz2, .tbz2) and convert to universal ZIP or TAR.',
    primaryExtension: '.tar.bz2',
    supportedExtensions: ['.tar.bz2', '.tbz2', '.tbz'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Burrows-Wheeler Transform compression wrapping POSIX USTAR',
      compressionMethod: 'BZIP2 (BWT + MTF + Run Length Encoding + Huffman)',
      typicalUseCases: ['Linux kernel source trees', 'Gentoo Portage packages', 'High-compression Unix archives'],
      magicBytes: '42 5A 68 (BZh)'
    }
  },
  'bzip2-converter': {
    id: 'bzip2-converter',
    name: 'BZIP2 Converter (.bz2)',
    shortDescription: 'Decompress single-stream bzip2 files (.bz2) into uncompressed documents, or convert to ZIP.',
    primaryExtension: '.bz2',
    supportedExtensions: ['.bz2'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'Julian Seward Bzip2 block-sorting data compression format',
      compressionMethod: 'Burrows-Wheeler block sorting with 900k block size',
      typicalUseCases: ['Wikipedia database dumps', 'Scientific raw calculation tables', 'Server log archiving'],
      magicBytes: '42 5A 68 39 (BZh9)'
    }
  },
  'tar-xz-converter': {
    id: 'tar-xz-converter',
    name: 'TAR.XZ Converter & Extractor',
    shortDescription: 'Decompress and convert high-ratio LZMA2 XZ tarballs (.tar.xz, .txz) into ZIP or plain TAR.',
    primaryExtension: '.tar.xz',
    supportedExtensions: ['.tar.xz', '.txz'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'The XZ file format containing POSIX USTAR archive',
      compressionMethod: 'LZMA2 variable dictionary compression with CRC-64/SHA-256',
      typicalUseCases: ['Arch Linux packages (.pkg.tar.xz)', 'Debian packaging', 'Modern Linux distribution releases'],
      magicBytes: 'FD 37 7A 58 5A 00 (\\xFD7zXZ\\x00)'
    }
  },
  'xz-converter': {
    id: 'xz-converter',
    name: 'XZ Converter (.xz)',
    shortDescription: 'Decompress individual .xz files into raw uncompressed files or convert them directly to ZIP.',
    primaryExtension: '.xz',
    supportedExtensions: ['.xz'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'Tukaani project XZ container format with LZMA2 stream',
      compressionMethod: 'LZMA2 (Lempel-Ziv-Markov chain algorithm 2)',
      typicalUseCases: ['Kernel modules', 'Firmware binaries', 'Modern Linux system packaging'],
      magicBytes: 'FD 37 7A 58 5A 00'
    }
  },
  'tar-zst-converter': {
    id: 'tar-zst-converter',
    name: 'TAR.ZST Converter & Extractor',
    shortDescription: 'Extract Facebook Zstandard compressed tarballs (.tar.zst) and convert to ZIP or TAR in real-time.',
    primaryExtension: '.tar.zst',
    supportedExtensions: ['.tar.zst', '.tzst'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'RFC 8878 Zstandard compression algorithm wrapping POSIX USTAR',
      compressionMethod: 'Zstandard (FSE - Finite State Entropy + LZ77)',
      typicalUseCases: ['Arch Linux default packaging (.pkg.tar.zst)', 'Fedora RPM payloads', 'Real-time server logs'],
      magicBytes: '28 B5 2F FD (Zstandard Magic)'
    }
  },
  'zstandard-converter': {
    id: 'zstandard-converter',
    name: 'Zstandard Converter (.zst)',
    shortDescription: 'Decompress ultra-fast Zstandard (.zst) files to original files or convert them into ZIP archives.',
    primaryExtension: '.zst',
    supportedExtensions: ['.zst'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'Yann Collet / Meta Zstandard streaming specification (RFC 8878)',
      compressionMethod: 'Huff0 & tANS (table Finite State Entropy)',
      typicalUseCases: ['Big data pipeline streams (Kafka, Hadoop)', 'Game asset compression', 'Real-time telemetry'],
      magicBytes: '28 B5 2F FD'
    }
  },
  'lzma-converter': {
    id: 'lzma-converter',
    name: 'LZMA Converter (.lzma)',
    shortDescription: 'Decompress classic LZMA raw stream archives (.lzma) to uncompressed files or repackage as ZIP.',
    primaryExtension: '.lzma',
    supportedExtensions: ['.lzma'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'Raw 13-byte header LZMA stream (properties, dict size, uncompressed length)',
      compressionMethod: 'LZMA (Lempel-Ziv-Markov chain algorithm)',
      typicalUseCases: ['Embedded Linux firmware', 'Legacy 7-Zip individual streams', 'Microcontroller flash images'],
      magicBytes: '5D 00 00 (Properties byte 0x5D)'
    }
  },
  'lzh-lha-converter': {
    id: 'lzh-lha-converter',
    name: 'LZH / LHA Converter & Extractor',
    shortDescription: 'Extract vintage Japanese LHA/LZH archives (.lzh, .lha) and convert files to modern ZIP.',
    primaryExtension: '.lzh',
    supportedExtensions: ['.lzh', '.lha'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Haruyasu Yoshizaki LHA header format (-lh0-, -lh5-, -lh6-, -lh7-)',
      compressionMethod: 'LZSS with dynamic Huffman coding',
      typicalUseCases: ['Amiga OS software', 'PC-98 & MSX retro gaming', 'Japanese document archival'],
      magicBytes: '2D 6C 68 (-lh)'
    }
  },
  'arj-converter': {
    id: 'arj-converter',
    name: 'ARJ Converter & Extractor',
    shortDescription: 'Unpack classic DOS ARJ archives (.arj) and convert contained documents and programs into ZIP.',
    primaryExtension: '.arj',
    supportedExtensions: ['.arj'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Robert K. Jung ARJ (Archived by Robert Jung) specification',
      compressionMethod: 'LZ77 sliding dictionary with adaptive Huffman coding',
      typicalUseCases: ['MS-DOS BBS file shares', 'Retro PC software preservation', 'Floppy disk backup sets'],
      magicBytes: '60 EA (ARJ Header ID)'
    }
  },
  'cab-converter': {
    id: 'cab-converter',
    name: 'CAB Converter & Extractor',
    shortDescription: 'Extract Microsoft Cabinet archives (.cab) used in Windows setups, drivers, and convert to ZIP.',
    primaryExtension: '.cab',
    supportedExtensions: ['.cab'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Microsoft Cabinet File Format (MSCF) architecture',
      compressionMethod: 'MSZIP (Deflate), Quantum, or LZX',
      typicalUseCases: ['Windows driver distribution', 'Windows Installer (MSI) payloads', 'DirectX redistributables'],
      magicBytes: '4D 53 43 46 (MSCF)'
    }
  },
  'cpio-converter': {
    id: 'cpio-converter',
    name: 'CPIO Converter & Extractor',
    shortDescription: 'Unpack Unix CPIO archives (.cpio) in ASCII new/old formats and convert files to standard ZIP.',
    primaryExtension: '.cpio',
    supportedExtensions: ['.cpio'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'POSIX.1 CPIO archive format (SVR4 portable 070701 / 070702 / 070707)',
      compressionMethod: 'Stream-oriented uncompressed record headers with filename and data',
      typicalUseCases: ['Linux initramfs boot images', 'RPM package internal payloads', 'Unix tape backups'],
      magicBytes: '30 37 30 37 30 31 (070701 / 070702)'
    }
  },
  'wim-converter': {
    id: 'wim-converter',
    name: 'WIM Converter & Extractor',
    shortDescription: 'Inspect and extract Windows Imaging Format (.wim) system images and convert assets to ZIP.',
    primaryExtension: '.wim',
    supportedExtensions: ['.wim', '.swm', '.esd'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Microsoft Windows Imaging File Format (WIM) specification',
      compressionMethod: 'Single-instance storage file-based imaging with LZX or XPRESS',
      typicalUseCases: ['Windows OS installation media (install.wim)', 'Sysprep enterprise deployments', 'WinPE rescue tools'],
      magicBytes: '4D 53 57 49 4D 00 00 00 (MSWIM\\0\\0\\0)'
    }
  },
  'xar-converter': {
    id: 'xar-converter',
    name: 'XAR Converter & Extractor',
    shortDescription: 'Extract eXtensible ARchive (.xar, .pkg) packages used in macOS installers and convert to ZIP.',
    primaryExtension: '.xar',
    supportedExtensions: ['.xar', '.pkg'],
    category: 'archive',
    mode: 'converter',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'eXtensible ARchive format with XML Table of Contents header',
      compressionMethod: 'Gzip/Bzip2/LZMA compressed heap with XML metadata catalog',
      typicalUseCases: ['Apple macOS installer packages (.pkg)', 'Safari browser extensions (.safariextz)', 'RPM v5 archives'],
      magicBytes: '78 61 72 21 (xar!)'
    }
  },
  'unix-compress-converter': {
    id: 'unix-compress-converter',
    name: 'Unix Compress Converter (.Z)',
    shortDescription: 'Decompress classic Unix Compress files (.Z) using adaptive LZW decompression or convert to ZIP.',
    primaryExtension: '.Z',
    supportedExtensions: ['.Z'],
    category: 'archive',
    mode: 'stream',
    defaultTargetFormat: 'uncompressed',
    availableTargets: ['uncompressed', 'zip'],
    technicalDetails: {
      formatSpecs: 'Traditional Unix compress utility (Spencer / Thomas / Welch LZW algorithm)',
      compressionMethod: 'Modified Lempel-Ziv-Welch (LZW) with 9 to 16 variable bit length',
      typicalUseCases: ['Historical Unix archives (BSD, SunOS, IRIX)', 'Usenet news spools', 'Early RFC standards'],
      magicBytes: '1F 9D (Unix Compress Signature)'
    }
  },
  'iso-extractor': {
    id: 'iso-extractor',
    name: 'ISO Disc Image Extractor',
    shortDescription: 'Unpack ISO 9660 optical disc images (.iso) of CDs, DVDs, and Linux distros without burning.',
    primaryExtension: '.iso',
    supportedExtensions: ['.iso'],
    category: 'archive',
    mode: 'extractor',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'ISO 9660 (ECMA-119) CD-ROM filesystem standard with Primary Volume Descriptor',
      compressionMethod: 'Uncompressed sector-by-sector filesystem image (2048 bytes/sector)',
      typicalUseCases: ['Operating system installation media (Ubuntu, Windows)', 'CD/DVD software preservation', 'Virtual machine disc mounts'],
      magicBytes: '43 44 30 30 31 (CD001 at sector 16 offset 32768)'
    }
  },
  'dmg-extractor': {
    id: 'dmg-extractor',
    name: 'DMG Disk Image Extractor',
    shortDescription: 'Unpack Apple macOS disk images (.dmg) and extract applications, binaries, and files into ZIP.',
    primaryExtension: '.dmg',
    supportedExtensions: ['.dmg'],
    category: 'archive',
    mode: 'extractor',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Apple Universal Disk Image Format (UDIF) and HFS+/APFS container',
      compressionMethod: 'ADC, zlib, or bzip2 compressed blocks with XML plist trailer',
      typicalUseCases: ['macOS application installers', 'Mac developer tools distribution', 'Apple disk backup archives'],
      magicBytes: '6B 6F 6C 79 (koly trailer) / ISO CD001'
    }
  },
  'deb-archive-extractor': {
    id: 'deb-archive-extractor',
    name: 'DEB Package Extractor',
    shortDescription: 'Unpack Debian and Ubuntu software packages (.deb), extracting control metadata and binary files.',
    primaryExtension: '.deb',
    supportedExtensions: ['.deb'],
    category: 'archive',
    mode: 'extractor',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Debian binary package format (ar container with control.tar and data.tar)',
      compressionMethod: 'AR wrapper enclosing Gzip, XZ, or Zstandard compressed tarballs',
      typicalUseCases: ['Debian/Ubuntu package inspection', 'Extracting Linux binaries without root/apt', 'Dependency audits'],
      magicBytes: '21 3C 61 72 63 68 3E 0A (!<arch>\\n)'
    }
  },
  'rpm-archive-extractor': {
    id: 'rpm-archive-extractor',
    name: 'RPM Package Extractor',
    shortDescription: 'Unpack Red Hat, Fedora, and CentOS package files (.rpm) and extract contained files to ZIP.',
    primaryExtension: '.rpm',
    supportedExtensions: ['.rpm'],
    category: 'archive',
    mode: 'extractor',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'RPM Package Format v3.0 / v4.0 with header structures and payload archive',
      compressionMethod: '96-byte lead + signature + header tags wrapping compressed CPIO archive',
      typicalUseCases: ['RHEL / Fedora / openSUSE binary extraction', 'Sysadmin package inspection', 'Security auditing'],
      magicBytes: 'ED AB EE DB (RPM Lead Magic)'
    }
  },
  'ar-archive-extractor': {
    id: 'ar-archive-extractor',
    name: 'AR Archive Extractor',
    shortDescription: 'Extract Unix archive files (.ar, .a) used for static libraries and software distribution into ZIP.',
    primaryExtension: '.ar',
    supportedExtensions: ['.ar', '.a'],
    category: 'archive',
    mode: 'extractor',
    defaultTargetFormat: 'zip',
    availableTargets: ['zip', 'tar'],
    technicalDetails: {
      formatSpecs: 'Traditional UNIX common archive format (BSD / SysV / GNU variants)',
      compressionMethod: 'Sequential uncompressed members with 60-byte ASCII headers',
      typicalUseCases: ['C/C++ static compilation libraries (libname.a)', 'Debian package foundation', 'Embedded toolchains'],
      magicBytes: '21 3C 61 72 63 68 3E 0A (!<arch>\\n)'
    }
  }
};
