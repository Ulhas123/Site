#!/usr/bin/env python3
"""
Convert Godaan EPUB to Web Reader Novel Structure
Extracts chapters from 'Hindi_PDF_to_EPUB_Converter/गोदान - मुंशी प्रेमचंद.epub'
and outputs typed blocks (Rule 2), metadata, and custom SVG cover to 'public/novels/godaan/'.
"""

import os
import sys
import re
import json
import shutil
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple
from bs4 import BeautifulSoup
from ebooklib import epub
import ebooklib

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def generate_godaan_svg_cover() -> str:
    """Generate high-quality semantic SVG cover for Munshi Premchand's Godaan."""
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="godaan-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140f0b"/>
      <stop offset="40%" stop-color="#24140d"/>
      <stop offset="70%" stop-color="#1c110b"/>
      <stop offset="100%" stop-color="#0a0705"/>
    </linearGradient>
    <linearGradient id="godaan-gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="godaan-saffron" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <radialGradient id="godaan-glow" cx="50%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="900" fill="url(#godaan-bg)"/>
  <circle cx="300" cy="350" r="240" fill="url(#godaan-glow)"/>

  <!-- Ornate Frame Borders -->
  <rect x="22" y="22" width="556" height="856" rx="14" fill="none" stroke="url(#godaan-gold)" stroke-width="2" stroke-opacity="0.5"/>
  <rect x="32" y="32" width="536" height="836" rx="10" fill="none" stroke="#d97706" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Corner Flourishes -->
  <path d="M 40,70 L 70,40 M 40,40 L 75,40 M 40,40 L 40,75" stroke="url(#godaan-gold)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 560,70 L 530,40 M 560,40 L 525,40 M 560,40 L 560,75" stroke="url(#godaan-gold)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 40,830 L 70,860 M 40,860 L 75,860 M 40,860 L 40,825" stroke="url(#godaan-gold)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 560,830 L 530,860 M 560,860 L 525,860 M 560,860 L 560,825" stroke="url(#godaan-gold)" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- Top Badge -->
  <g transform="translate(300, 105)">
    <rect x="-140" y="-18" width="280" height="36" rx="18" fill="#2d170a" stroke="url(#godaan-gold)" stroke-width="1.5" stroke-opacity="0.7"/>
    <text x="0" y="5" font-family="'Noto Serif Devanagari', 'Nirmala UI', serif" font-size="13" font-weight="700" letter-spacing="4" fill="#fbbf24" text-anchor="middle">कालजयी महाकाव्य • HINDI CLASSIC</text>
  </g>

  <!-- Center Artwork: Sun, Wheat and Cow Motif Elements -->
  <g transform="translate(300, 310)">
    <!-- Sun Rays & Radiant Ring -->
    <circle cx="0" cy="0" r="130" fill="none" stroke="url(#godaan-gold)" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="8 6"/>
    <circle cx="0" cy="0" r="110" fill="#291206" fill-opacity="0.7" stroke="#d97706" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle cx="0" cy="0" r="85" fill="none" stroke="url(#godaan-gold)" stroke-width="1" stroke-opacity="0.3"/>

    <!-- Sacred Cow & Agricultural Life Silhouette (Semantic Vector Motif) -->
    <path d="M -50,45 C -45,15 -25,-10 0,-15 C 25,-10 45,15 50,45 Z" fill="url(#godaan-saffron)" fill-opacity="0.25"/>
    <!-- Central Icon: Book & Cow Horn Symbolism -->
    <path d="M -35,15 Q 0,-25 35,15 Q 0,40 -35,15 Z" fill="none" stroke="url(#godaan-gold)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="15" r="12" fill="#fbbf24"/>
    <circle cx="0" cy="15" r="5" fill="#1c110b"/>
    <!-- Lotus / Wheat Flakes -->
    <path d="M 0,-40 C -15,-60 0,-75 0,-75 C 0,-75 15,-60 0,-40 Z" fill="url(#godaan-gold)"/>
    <path d="M -25,-30 C -45,-45 -40,-65 -40,-65 C -40,-65 -20,-55 -25,-30 Z" fill="url(#godaan-gold)" fill-opacity="0.75"/>
    <path d="M 25,-30 C 45,-45 40,-65 40,-65 C 40,-65 20,-55 25,-30 Z" fill="url(#godaan-gold)" fill-opacity="0.75"/>
  </g>

  <!-- Title: Devanagari "गोदान" -->
  <text x="300" y="525" font-family="'Noto Serif Devanagari', 'Nirmala UI', 'Mangal', serif" font-size="76" font-weight="900" letter-spacing="4" fill="url(#godaan-gold)" text-anchor="middle" filter="drop-shadow(0px 4px 12px rgba(0,0,0,0.8))">गोदान</text>

  <!-- Title: English "GODAAN" -->
  <text x="300" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="14" fill="#fed7aa" text-anchor="middle">GODAAN</text>

  <!-- Separator Line with Diamond -->
  <g transform="translate(300, 630)">
    <line x1="-150" y1="0" x2="-20" y2="0" stroke="url(#godaan-gold)" stroke-width="1.5" stroke-opacity="0.7"/>
    <polygon points="0,-6 6,0 0,6 -6,0" fill="#fbbf24"/>
    <line x1="20" y1="0" x2="150" y2="0" stroke="url(#godaan-gold)" stroke-width="1.5" stroke-opacity="0.7"/>
  </g>

  <!-- Subtitle -->
  <text x="300" y="670" font-family="'Noto Serif Devanagari', 'Nirmala UI', serif" font-size="16" font-style="italic" fill="#fdba74" text-anchor="middle">भारतीय कृषक जीवन का अमर महाकाव्य</text>

  <!-- Author: Munshi Premchand -->
  <g transform="translate(300, 755)">
    <text x="0" y="0" font-family="'Noto Serif Devanagari', 'Nirmala UI', serif" font-size="26" font-weight="700" letter-spacing="2" fill="#fffbeb" text-anchor="middle">मुंशी प्रेमचंद</text>
    <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="6" fill="#fcd34d" text-anchor="middle">MUNSHI PREMCHAND</text>
  </g>

  <!-- Footer Edition Marker -->
  <text x="300" y="835" font-family="monospace" font-size="11" letter-spacing="3" fill="#78350f" text-anchor="middle">COMPLETE 36 CHAPTERS • 1936-2026</text>
</svg>"""


def clean_paragraphs(raw_paras: List[str]) -> List[str]:
    """Clean OCR header/footer artifacts from raw paragraph strings."""
    cleaned = list(raw_paras)

    # Clean leading OCR noise
    while cleaned and (
        cleaned[0] in ['प्रेमचंद', 'गोदान', 'हि']
        or re.match(r'^[।\|\s\d\[\]\.\-॥\(\)]+$', cleaned[0])
    ):
        cleaned.pop(0)

    # Clean trailing OCR noise
    while cleaned and (
        cleaned[-1] in ['के के ने', 'कै मेरे']
        or re.match(r'^[।\|\s\d\[\]\.\-॥\(\)]+$', cleaned[-1])
    ):
        cleaned.pop()

    # Strip trailing phrase artifacts if attached to final sentence
    if cleaned and cleaned[-1].endswith(' कै मेरे'):
        cleaned[-1] = cleaned[-1][:-8].strip()

    return cleaned


def classify_chapter_blocks(paras: List[str], chapter_prefix: str) -> List[Dict[str, Any]]:
    """Transform paragraphs into typed blocks (Rule 2)."""
    blocks: List[Dict[str, Any]] = []
    block_counter = 1

    quote_starts = ("'", '"', '‘', '“', '«', '`')
    quote_ends = ("'", '"', '’', '”', '»', '`')

    speaker_pattern = re.compile(
        r'^([A-Za-z\u0900-\u097F\s\'\.\-]{2,25})[:：]\s*(.+)$'
    )

    for p in paras:
        p_str = p.strip()
        if not p_str:
            continue

        block_id = f"{chapter_prefix}-b{block_counter:02d}"

        # 1. Scene Break
        if re.match(r'^[\*\-\~_]{3,}$', p_str) or p_str in ['* * *', '***', '---']:
            blocks.append({
                "id": block_id,
                "type": "sceneBreak",
                "marker": "* * *"
            })
            block_counter += 1
            continue

        # 2. Speaker Dialogue (e.g. "धनिया: '...'")
        sp_match = speaker_pattern.match(p_str)
        if sp_match:
            speaker_name = sp_match.group(1).strip()
            speech_body = sp_match.group(2).strip()
            if speech_body.startswith(quote_starts) and speech_body.endswith(quote_ends):
                blocks.append({
                    "id": block_id,
                    "type": "dialogue",
                    "speaker": speaker_name,
                    "text": speech_body
                })
                block_counter += 1
                continue

        # 3. Direct Dialogue in quotes
        if p_str.startswith(quote_starts) and p_str.endswith(quote_ends):
            blocks.append({
                "id": block_id,
                "type": "dialogue",
                "text": p_str
            })
            block_counter += 1
            continue

        # 4. Standard narrative prose
        blocks.append({
            "id": block_id,
            "type": "text",
            "text": p_str
        })
        block_counter += 1

    return blocks


def main():
    print("=" * 70)
    print("📚 Converting Godaan EPUB to Web Novel Reader Structure")
    print("=" * 70)

    site_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    epub_path = os.path.abspath(
        os.path.join(site_dir, "..", "Hindi_PDF_to_EPUB_Converter", "गोदान - मुंशी प्रेमचंद.epub")
    )

    if not os.path.exists(epub_path):
        print(f"❌ Error: EPUB not found at {epub_path}")
        sys.exit(1)

    print(f"📖 Source EPUB: {epub_path}")

    # Destination directories
    public_novels_dir = os.path.join(site_dir, "public", "novels")
    godaan_dir = os.path.join(public_novels_dir, "godaan")
    chapters_dir = os.path.join(godaan_dir, "chapters")

    os.makedirs(chapters_dir, exist_ok=True)

    # 1. Read EPUB
    book = epub.read_epub(epub_path)
    docs = [i for i in book.get_items() if i.get_type() == ebooklib.ITEM_DOCUMENT]
    print(f"📄 Found {len(docs)} documents in EPUB.")

    # In our analysis: docs[2] to docs[37] correspond to chap_1.xhtml through chap_36.xhtml
    chapter_docs = []
    for d in docs:
        name = d.get_name()
        if re.search(r'chap_\d+\.xhtml', name):
            chapter_docs.append(d)

    # Sort numerically by chapter number in filename
    chapter_docs.sort(key=lambda x: int(re.search(r'chap_(\d+)\.xhtml', x.get_name()).group(1)))
    print(f"📑 Identified {len(chapter_docs)} chapters.")

    chapter_metas: List[Dict[str, Any]] = []
    base_date = datetime(1936, 6, 1, 0, 0, 0, tzinfo=timezone.utc)

    total_words_novel = 0

    for idx, doc in enumerate(chapter_docs, start=1):
        ch_num = idx
        ch_id = f"chapter-{ch_num}"
        prefix = f"ch{ch_num:02d}"

        soup = BeautifulSoup(doc.get_content(), "html.parser")
        raw_paras = [p.get_text().strip() for p in soup.find_all("p") if p.get_text().strip()]
        cleaned_paras = clean_paragraphs(raw_paras)

        blocks = classify_chapter_blocks(cleaned_paras, prefix)
        word_count = sum(len(p.split()) for p in cleaned_paras)
        total_words_novel += word_count

        pub_iso = (base_date + timedelta(days=ch_num * 3)).isoformat()

        chapter_obj = {
            "id": ch_id,
            "number": ch_num,
            "title": f"अध्याय {ch_num}",
            "wordCount": word_count,
            "publishedAt": pub_iso,
            "translator": "मुंशी प्रेमचंद",
            "editor": "प्रेमचंद (मूल पाठ)",
            "blocks": blocks
        }

        # Write chapter JSON
        ch_json_file = os.path.join(chapters_dir, f"{ch_id}.json")
        with open(ch_json_file, "w", encoding="utf-8") as f:
            json.dump(chapter_obj, f, indent=2, ensure_ascii=False)

        # Collect chapter meta (blocks omitted)
        chapter_metas.append({
            "id": ch_id,
            "number": ch_num,
            "title": f"अध्याय {ch_num}",
            "wordCount": word_count,
            "publishedAt": pub_iso,
            "translator": "मुंशी प्रेमचंद",
            "editor": "प्रेमचंद (मूल पाठ)"
        })

    print(f"✅ Generated {len(chapter_metas)} chapter JSON files ({total_words_novel:,} total words).")

    # 2. Generate and write cover.svg
    cover_svg = generate_godaan_svg_cover()
    cover_path = os.path.join(godaan_dir, "cover.svg")
    with open(cover_path, "w", encoding="utf-8") as f:
        f.write(cover_svg)
    print(f"🎨 Saved cover SVG to {cover_path}")

    # 3. Copy EPUB into novel directory for reference / download
    epub_dest = os.path.join(godaan_dir, "godaan.epub")
    shutil.copyfile(epub_path, epub_dest)
    print(f"📦 Copied standalone EPUB to {epub_dest}")

    # 4. Copy font file NotoSerifDevanagari.ttf to public/fonts if available
    font_src = os.path.abspath(
        os.path.join(site_dir, "..", "Hindi_PDF_to_EPUB_Converter", "NotoSerifDevanagari.ttf")
    )
    if os.path.exists(font_src):
        fonts_dest_dir = os.path.join(site_dir, "public", "fonts")
        os.makedirs(fonts_dest_dir, exist_ok=True)
        shutil.copyfile(font_src, os.path.join(fonts_dest_dir, "NotoSerifDevanagari.ttf"))
        print(f"🔤 Copied NotoSerifDevanagari.ttf to public/fonts/")

    # 5. Write novel.json
    synopsis = (
        "मुंशी प्रेमचंद का अमर कालजयी महाकाव्यात्मक उपन्यास 'गोदान'। यह भारतीय कृषक जीवन, "
        "होरी और धनिया के अटूट संघर्ष, सामाजिक मर्यादाओं, महाजनी शोषण और मर्यादा की रक्षा का "
        "सबसे जीवंत और मार्मिक यथार्थवादी दस्तावेज़ है।"
    )

    novel_obj = {
        "id": "godaan",
        "title": "गोदान (Godaan)",
        "author": "मुंशी प्रेमचंद (Munshi Premchand)",
        "synopsis": synopsis,
        "cover": "/novels/godaan/cover.svg",
        "epubUrl": "/novels/godaan/godaan.epub",
        "chapters": chapter_metas
    }

    novel_json_path = os.path.join(godaan_dir, "novel.json")
    with open(novel_json_path, "w", encoding="utf-8") as f:
        json.dump(novel_obj, f, indent=2, ensure_ascii=False)
    print(f"📑 Saved novel.json to {novel_json_path}")

    # 6. Update public/novels/index.json
    index_json_path = os.path.join(public_novels_dir, "index.json")
    index_data: List[Dict[str, Any]] = []
    if os.path.exists(index_json_path):
        try:
            with open(index_json_path, "r", encoding="utf-8") as f:
                index_data = json.load(f)
        except Exception:
            index_data = []

    # Remove existing godaan entry if present, then insert
    index_data = [item for item in index_data if item.get("id") != "godaan"]

    # Insert godaan in the novel section (before study if study is present, or after supremacy-games)
    godaan_summary = {
        "id": "godaan",
        "title": "गोदान (Godaan)",
        "author": "मुंशी प्रेमचंद (Munshi Premchand)",
        "synopsis": synopsis,
        "cover": "/novels/godaan/cover.svg",
        "totalChapters": len(chapter_metas),
        "firstChapterId": "chapter-1"
    }

    # Position in list: right after other webnovels, before study category
    insert_idx = len(index_data)
    for i, itm in enumerate(index_data):
        if itm.get("category") == "study":
            insert_idx = i
            break
    index_data.insert(insert_idx, godaan_summary)

    with open(index_json_path, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)
    print(f"📋 Updated {index_json_path} (Total novels in library: {len(index_data)})")

    # 7. Update src/data/novelsRegistry.ts
    registry_ts_path = os.path.join(site_dir, "src", "data", "novelsRegistry.ts")
    novels_json_str = json.dumps(index_data, indent=2, ensure_ascii=False)
    registry_content = f"""// AUTO-GENERATED BY scripts/convert_godaan_to_site.py - DO NOT EDIT DIRECTLY
export interface NovelSummary {{
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover: string;
  totalChapters: number;
  firstChapterId: string;
  category?: 'novel' | 'study';
  pdfUrl?: string;
}}

export const INITIALIZED_NOVELS: NovelSummary[] = {novels_json_str};
"""
    with open(registry_ts_path, "w", encoding="utf-8") as f:
        f.write(registry_content)
    print(f"🔗 Updated {registry_ts_path}")

    # 8. Mirror to dist/novels if dist exists
    dist_novels_dir = os.path.join(site_dir, "dist", "novels")
    if os.path.exists(dist_novels_dir):
        dist_godaan_dir = os.path.join(dist_novels_dir, "godaan")
        if os.path.exists(dist_godaan_dir):
            shutil.rmtree(dist_godaan_dir)
        shutil.copytree(godaan_dir, dist_godaan_dir)
        shutil.copyfile(index_json_path, os.path.join(dist_novels_dir, "index.json"))
        print("🚀 Mirrored assets to dist/novels/")

    print("\n🎉 Godaan novel successfully converted and pushed to novel's section!")


if __name__ == "__main__":
    main()
