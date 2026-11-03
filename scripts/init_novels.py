#!/usr/bin/env python3
"""
Novel Initialization Script for Webnovel Reader
Scans scraped novels from NovelFire scraper (downloads directory), transforms raw text
into typed content blocks (Rule 2), generates covers and metadata, and initializes
them into the website's public/novels/ directory and registry.

Usage:
    python scripts/init_novels.py
    python scripts/init_novels.py --source ../Scrapper/downloads --output ./public/novels
    python scripts/init_novels.py --novel supremacy-games --max-chapters 50
"""

import os
import sys
import re
import json
import argparse
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Tuple

# Windows UTF-8 output handling
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

try:
    from ebooklib import epub
    HAS_EBOOKLIB = True
except ImportError:
    HAS_EBOOKLIB = False


# ==============================================================================
# Helper Utilities
# ==============================================================================

def slugify(text: str) -> str:
    """Normalize string into a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^a-z0-9-]', '', text)
    return re.sub(r'-+', '-', text).strip('-')


def clean_title_from_slug(slug: str) -> str:
    """Format human-friendly title from directory slug."""
    words = slug.replace('_', '-').split('-')
    capitalized = [w.capitalize() for w in words if w]
    return ' '.join(capitalized)


def generate_svg_cover(title: str, author: str, theme_accent: str = "#38bdf8", theme_sec: str = "#818cf8") -> str:
    """Generate high-quality semantic SVG cover as standalone asset and data URI."""
    # Break long titles into 2 or 3 lines
    words = title.upper().split()
    lines: List[str] = []
    current_line: List[str] = []
    
    for w in words:
        if len(' '.join(current_line + [w])) <= 16:
            current_line.append(w)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [w]
    if current_line:
        lines.append(' '.join(current_line))
    
    if len(lines) > 3:
        lines = lines[:3]
        lines[-1] += "..."

    title_elements = []
    base_y = 570 - ((len(lines) - 1) * 30)
    for i, line in enumerate(lines):
        fill = 'url(#accent)' if i == len(lines) - 1 else '#f8fafc'
        y = base_y + (i * 54)
        safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        title_elements.append(
            f'<text x="300" y="{y}" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" letter-spacing="3" fill="{fill}" text-anchor="middle">{safe_line}</text>'
        )
    
    title_xml = "\n  ".join(title_elements)
    safe_author = author.upper().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="50%" stop-color="#12182c"/>
      <stop offset="100%" stop-color="#05070e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{theme_accent}"/>
      <stop offset="100%" stop-color="{theme_sec}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="50%">
      <stop offset="0%" stop-color="{theme_accent}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <circle cx="300" cy="360" r="240" fill="url(#glow)"/>
  <rect x="24" y="24" width="552" height="852" fill="none" stroke="{theme_accent}" stroke-opacity="0.3" stroke-width="2" rx="8"/>
  <circle cx="300" cy="340" r="130" fill="none" stroke="url(#accent)" stroke-width="3" stroke-dasharray="8 6"/>
  <polygon points="300,240 370,390 230,390" fill="none" stroke="{theme_sec}" stroke-width="2" stroke-opacity="0.7"/>
  <circle cx="300" cy="340" r="14" fill="{theme_accent}"/>
  <text x="300" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="6" fill="#94a3b8" text-anchor="middle">WEBNOVEL &#8226; NOVELFIRE ARCHIVE</text>
  {title_xml}
  <line x1="200" y1="715" x2="400" y2="715" stroke="#334155" stroke-width="1"/>
  <text x="300" y="760" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="#cbd5e1" text-anchor="middle">{safe_author}</text>
</svg>"""
    return svg


# ==============================================================================
# Rule 2: Typed Block Classification Engine
# ==============================================================================

SCENE_BREAK_PATTERNS = [
    re.compile(r'^(\*{3,}|-{3,}|_{3,}|~{3,}|[✦*•#\s-]{3,})$'),
    re.compile(r'^\s*\.\.\.\s*$'),
    re.compile(r'^\s*(\*|\-|\~|\#|\✦)(\s*(\*|\-|\~|\#|\✦)){2,}\s*$')
]

AUTHOR_NOTE_PATTERN = re.compile(
    r'^(?:Author(?:\'s)?\s*Note|A/?N|TL\s*Note|T/?N|Translator\s*Note|Note)\s*[:：\-]\s*(.*)$',
    re.IGNORECASE
)

DIALOGUE_SPEAKER_PATTERN = re.compile(
    r'^([A-Z][A-Za-z0-9\s\'\.\-]{1,30})[:：]\s*([“"‘\'「『].+[”"’\'」』])$'
)

DIALOGUE_QUOTE_START = ('"', '“', '「', '『', "'", '‘')
DIALOGUE_QUOTE_END = ('"', '”', '」', '』', "'", '’')


def is_system_prompt(text: str) -> bool:
    """Detect if text represents a game or cultivation system notification/panel."""
    t = text.strip()
    if t.startswith('[') and t.endswith(']') and len(t) > 2:
        return True
    if any(header in t.upper() for header in ['[HOST:', '[STATUS', '[SYSTEM NOTIFICATION', '[COMPREHENSION:', '[ATTRIBUTE']):
        return True
    return False


def classify_paragraphs_into_blocks(paragraphs: List[str], chapter_prefix: str) -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """
    Transforms raw paragraphs into strictly typed blocks (Rule 2).
    Returns (blocks, optional_author_thoughts).
    """
    blocks: List[Dict[str, Any]] = []
    author_thoughts: Optional[str] = None
    block_counter = 1

    i = 0
    while i < len(paragraphs):
        raw_p = paragraphs[i].strip()
        if not raw_p:
            i += 1
            continue

        block_id = f"{chapter_prefix}-b{block_counter:02d}"

        # 1. Scene Break
        if any(pat.match(raw_p) for pat in SCENE_BREAK_PATTERNS):
            blocks.append({
                "id": block_id,
                "type": "sceneBreak",
                "marker": "* * *"
            })
            block_counter += 1
            i += 1
            continue

        # 2. System Notification / Attribute Panel
        if is_system_prompt(raw_p):
            system_lines: List[str] = []
            
            # Look ahead for consecutive system lines
            while i < len(paragraphs) and is_system_prompt(paragraphs[i].strip()):
                line = paragraphs[i].strip()
                # Strip outermost brackets if cleanly enclosed
                if line.startswith('[') and line.endswith(']'):
                    line = line[1:-1].strip()
                system_lines.append(line)
                i += 1

            title = "[ SYSTEM NOTIFICATION ]"
            if system_lines and any(kw in system_lines[0].upper() for kw in ['HOST', 'STATUS', 'COMPREHENSION', 'SYSTEM']):
                title = f"[ {system_lines[0].upper()} ]"
                display_lines = system_lines[1:] if len(system_lines) > 1 else system_lines
            else:
                display_lines = system_lines

            blocks.append({
                "id": block_id,
                "type": "system",
                "title": title,
                "lines": display_lines,
                "text": "System prompt registered."
            })
            block_counter += 1
            continue

        # 3. Author / Translator Note
        an_match = AUTHOR_NOTE_PATTERN.match(raw_p)
        if an_match:
            note_content = an_match.group(1).strip() or raw_p
            if i >= len(paragraphs) - 2:
                # Trailing author note preserved as thoughts
                author_thoughts = note_content
            blocks.append({
                "id": block_id,
                "type": "authorNote",
                "title": "Author Note",
                "text": note_content
            })
            block_counter += 1
            i += 1
            continue

        # 4. Spoken Dialogue
        # Case A: Explicit speaker prefix (e.g. Valen: "...")
        speaker_match = DIALOGUE_SPEAKER_PATTERN.match(raw_p)
        if speaker_match:
            speaker_name = speaker_match.group(1).strip()
            speech_text = speaker_match.group(2).strip()
            blocks.append({
                "id": block_id,
                "type": "dialogue",
                "speaker": speaker_name,
                "text": speech_text
            })
            block_counter += 1
            i += 1
            continue

        # Case B: Standard quoted dialogue
        if raw_p.startswith(DIALOGUE_QUOTE_START) and raw_p.endswith(DIALOGUE_QUOTE_END):
            blocks.append({
                "id": block_id,
                "type": "dialogue",
                "text": raw_p
            })
            block_counter += 1
            i += 1
            continue

        # 5. Narrative Text
        blocks.append({
            "id": block_id,
            "type": "text",
            "text": raw_p
        })
        block_counter += 1
        i += 1

    return blocks, author_thoughts


# ==============================================================================
# Chapter Parsing Handlers
# ==============================================================================

def parse_markdown_chapter_file(file_path: str, fallback_no: int) -> Tuple[int, str, List[str], int]:
    """Parse chapter content from NovelFire .md or .txt chapter export."""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Split frontmatter metadata if present
    parts = text.split('\n---\n\n', 1)
    if len(parts) > 1:
        header_text = parts[0]
        body_text = parts[1]
    else:
        header_text = ""
        body_text = text

    # Extract chapter number and title
    chapter_no = fallback_no
    chapter_title = f"Chapter {fallback_no}"

    # Try matching '# Chapter X: Title'
    h1_match = re.search(r'^#\s*(Chapter\s+(\d+)[\s:：\-]+(.*))$', header_text or body_text, re.MULTILINE | re.IGNORECASE)
    if h1_match:
        try:
            chapter_no = int(h1_match.group(2))
            clean_name = h1_match.group(3).strip()
            chapter_title = f"Chapter {chapter_no}: {clean_name}" if clean_name else f"Chapter {chapter_no}"
        except ValueError:
            pass
    else:
        # Match from filename: Chapter_0001 - Name.md
        fn = os.path.basename(file_path)
        fn_match = re.match(r'Chapter_(\d+)\s*-\s*(.+)\.(md|txt)$', fn, re.IGNORECASE)
        if fn_match:
            chapter_no = int(fn_match.group(1))
            clean_name = fn_match.group(2).strip()
            chapter_title = f"Chapter {chapter_no}: {clean_name}"

    paragraphs = [p.strip() for p in body_text.split('\n\n') if p.strip()]
    word_count = sum(len(p.split()) for p in paragraphs)

    return chapter_no, chapter_title, paragraphs, word_count


# ==============================================================================
# Novel Importer Coordinator
# ==============================================================================

class NovelInitializer:
    def __init__(self, source_dir: str, output_dir: str, force: bool = False, max_chapters: Optional[int] = None):
        self.source_dir = os.path.abspath(source_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.force = force
        self.max_chapters = max_chapters
        self.initialized_novels: List[Dict[str, Any]] = []

    def run(self, filter_novel: Optional[str] = None):
        print("=" * 70)
        print("🚀 NovelFire -> Webnovel Reader Initializer")
        print(f"📁 Source: {self.source_dir}")
        print(f"🌐 Output: {self.output_dir}")
        if self.max_chapters:
            print(f"⚡ Max chapters per novel: {self.max_chapters}")
        print("=" * 70)

        if not os.path.exists(self.source_dir):
            print(f"❌ Error: Source directory '{self.source_dir}' does not exist.")
            return

        os.makedirs(self.output_dir, exist_ok=True)

        candidate_dirs = [
            d for d in os.listdir(self.source_dir)
            if os.path.isdir(os.path.join(self.source_dir, d)) and not d.startswith('.')
        ]

        if filter_novel:
            candidate_dirs = [d for d in candidate_dirs if filter_novel.lower() in d.lower()]

        if not candidate_dirs:
            print("⚠️ No downloaded novel directories found in source.")
            return

        print(f"📚 Found {len(candidate_dirs)} candidate novel(s): {', '.join(candidate_dirs)}\n")

        for novel_folder in candidate_dirs:
            novel_path = os.path.join(self.source_dir, novel_folder)
            try:
                self.process_novel_directory(novel_folder, novel_path)
            except Exception as e:
                print(f"❌ Error processing novel '{novel_folder}': {e}")
                import traceback
                traceback.print_exc()

        # Write master index and TypeScript registry
        self.write_master_catalog()
        print("\n✨ All novels processed and initialized successfully!")

    def process_novel_directory(self, folder_name: str, folder_path: str):
        print(f"\n📖 Processing novel: [{folder_name}]...")
        slug = slugify(folder_name)
        novel_dest_dir = os.path.join(self.output_dir, slug)
        chapters_dest_dir = os.path.join(novel_dest_dir, "chapters")
        os.makedirs(chapters_dest_dir, exist_ok=True)

        meta_json_path = os.path.join(folder_path, "metadata.json")
        epub_candidates = [f for f in os.listdir(folder_path) if f.lower().endswith('.epub')]
        chapters_dir = os.path.join(folder_path, "chapters")

        novel_title = clean_title_from_slug(folder_name)
        author_name = "NovelFire"
        synopsis = "A thrilling webnovel downloaded directly from NovelFire."

        # 1. Read metadata from EPUB if available
        if epub_candidates and HAS_EBOOKLIB:
            try:
                epub_file = os.path.join(folder_path, epub_candidates[0])
                book = epub.read_epub(epub_file)
                titles = book.get_metadata('DC', 'title')
                creators = book.get_metadata('DC', 'creator')
                if titles and titles[0][0]:
                    novel_title = titles[0][0].strip()
                if creators and creators[0][0]:
                    author_name = creators[0][0].strip()
            except Exception:
                pass

        chapters_data: List[Dict[str, Any]] = []

        # 2. Extract chapters from metadata.json or individual files
        if os.path.exists(meta_json_path):
            print("  Found structured metadata.json!")
            with open(meta_json_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
            novel_title = meta.get("novel_title") or novel_title
            raw_chapters = meta.get("chapters", [])
            if self.max_chapters:
                raw_chapters = raw_chapters[:self.max_chapters]

            for ch in raw_chapters:
                ch_no = ch.get("chapter_no", 1)
                ch_title = ch.get("full_title") or f"Chapter {ch_no}: {ch.get('chapter_name', '')}"
                content = ch.get("content", "")
                paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
                word_count = ch.get("word_count") or sum(len(p.split()) for p in paragraphs)

                chapters_data.append({
                    "number": ch_no,
                    "title": ch_title,
                    "paragraphs": paragraphs,
                    "word_count": word_count
                })
        elif os.path.exists(chapters_dir):
            print(f"  Scanning chapters folder: {chapters_dir}")
            chapter_files = [
                f for f in os.listdir(chapters_dir)
                if f.endswith('.md') or f.endswith('.txt')
            ]
            # Prioritize .md over .txt if duplicates exist
            md_files = [f for f in chapter_files if f.endswith('.md')]
            active_files = md_files if md_files else chapter_files
            active_files.sort()

            if self.max_chapters:
                active_files = active_files[:self.max_chapters]

            print(f"  Parsing {len(active_files)} chapter file(s)...")
            for idx, ch_file in enumerate(active_files):
                full_ch_path = os.path.join(chapters_dir, ch_file)
                ch_no, ch_title, paragraphs, word_count = parse_markdown_chapter_file(full_ch_path, idx + 1)
                chapters_data.append({
                    "number": ch_no,
                    "title": ch_title,
                    "paragraphs": paragraphs,
                    "word_count": word_count
                })

        # Ensure chapters are strictly ordered by chapter number
        chapters_data.sort(key=lambda x: x["number"])

        if not chapters_data:
            print("  ⚠️ Warning: No chapters found to initialize.")
            return

        # 3. Create Cover Art
        cover_filename = "cover.svg"
        cover_path = os.path.join(novel_dest_dir, cover_filename)
        cover_svg_content = generate_svg_cover(novel_title, author_name)
        with open(cover_path, 'w', encoding='utf-8') as f:
            f.write(cover_svg_content)
        cover_public_url = f"/novels/{slug}/{cover_filename}"

        # 4. Transform into typed blocks & write individual chapter JSONs
        chapter_metas: List[Dict[str, Any]] = []
        base_time = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc).timestamp()

        print(f"  Writing {len(chapters_data)} chapter JSONs with typed blocks (Rule 2)...")
        for ch in chapters_data:
            ch_num = ch["number"]
            ch_id = f"chapter-{ch_num}"
            prefix = f"ch{ch_num:02d}" if ch_num < 100 else f"ch{ch_num}"

            blocks, author_thoughts = classify_paragraphs_into_blocks(ch["paragraphs"], prefix)
            published_iso = datetime.fromtimestamp(base_time + (ch_num * 86400), tz=timezone.utc).isoformat()

            chapter_obj = {
                "id": ch_id,
                "number": ch_num,
                "title": ch["title"],
                "wordCount": ch["word_count"],
                "publishedAt": published_iso,
                "translator": "NovelFire",
                "editor": "NovelFire Scraper",
                "blocks": blocks
            }
            if author_thoughts:
                chapter_obj["authorThoughts"] = author_thoughts

            # Write individual chapter file
            ch_dest_file = os.path.join(chapters_dest_dir, f"{ch_id}.json")
            with open(ch_dest_file, 'w', encoding='utf-8') as f:
                json.dump(chapter_obj, f, indent=2, ensure_ascii=False)

            # Collect ChapterMeta (blocks omitted)
            chapter_metas.append({
                "id": ch_id,
                "number": ch_num,
                "title": ch["title"],
                "wordCount": ch["word_count"],
                "publishedAt": published_iso,
                "translator": "NovelFire",
                "editor": "NovelFire Scraper",
                "authorThoughts": author_thoughts
            })

        # Derive synopsis from first chapter if default
        if chapters_data:
            narrative_paras = [
                p for p in chapters_data[0]["paragraphs"]
                if not is_system_prompt(p) and len(p.split()) > 6 and not p.startswith(('-', '*', '#'))
            ]
            if narrative_paras:
                synopsis = ' '.join(narrative_paras[:2])
                if len(synopsis) > 280:
                    synopsis = synopsis[:277] + "..."

        # 5. Write novel.json
        novel_obj = {
            "id": slug,
            "title": novel_title,
            "author": author_name,
            "synopsis": synopsis,
            "cover": cover_public_url,
            "chapters": chapter_metas
        }
        with open(os.path.join(novel_dest_dir, "novel.json"), 'w', encoding='utf-8') as f:
            json.dump(novel_obj, f, indent=2, ensure_ascii=False)

        # 6. Register initialized novel summary
        self.initialized_novels.append({
            "id": slug,
            "title": novel_title,
            "author": author_name,
            "synopsis": synopsis,
            "cover": cover_public_url,
            "totalChapters": len(chapter_metas),
            "firstChapterId": chapter_metas[0]["id"] if chapter_metas else "chapter-1"
        })

        print(f"  ✅ Novel '{novel_title}' ready! ({len(chapter_metas)} chapters)")

    def write_master_catalog(self):
        """Write public/novels/index.json and update src/data/novelsRegistry.ts."""
        # 1. public/novels/index.json
        index_file = os.path.join(self.output_dir, "index.json")
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(self.initialized_novels, f, indent=2, ensure_ascii=False)
        print(f"\n📑 Saved library catalog index to {index_file}")

        # 2. src/data/novelsRegistry.ts
        registry_path = os.path.abspath(os.path.join(self.output_dir, "..", "..", "src", "data", "novelsRegistry.ts"))
        if os.path.exists(os.path.dirname(registry_path)):
            novels_json = json.dumps(self.initialized_novels, indent=2)
            registry_ts = f"""// AUTO-GENERATED BY scripts/init_novels.py - DO NOT EDIT DIRECTLY
export interface NovelSummary {{
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover: string;
  totalChapters: number;
  firstChapterId: string;
}}

export const INITIALIZED_NOVELS: NovelSummary[] = {novels_json};
"""
            with open(registry_path, 'w', encoding='utf-8') as f:
                f.write(registry_ts)
            print(f"🔗 Updated TypeScript registry at {registry_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Initialize NovelFire downloaded webnovels into the website.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "-s", "--source",
        default=os.path.join(os.path.dirname(__file__), "..", "..", "Scrapper", "downloads"),
        help="Source directory where novels were downloaded by novelfire_scraper.py"
    )
    parser.add_argument(
        "-o", "--output",
        default=os.path.join(os.path.dirname(__file__), "..", "public", "novels"),
        help="Destination directory in website public/ folder"
    )
    parser.add_argument(
        "-n", "--novel",
        default=None,
        help="Specify single novel slug to initialize (optional)"
    )
    parser.add_argument(
        "-m", "--max-chapters",
        type=int,
        default=None,
        help="Maximum chapters to import per novel (useful for fast testing)"
    )
    parser.add_argument(
        "-f", "--force",
        action="store_true",
        help="Force overwrite existing novel files"
    )

    args = parser.parse_args()
    initializer = NovelInitializer(
        source_dir=args.source,
        output_dir=args.output,
        force=args.force,
        max_chapters=args.max_chapters
    )
    initializer.run(filter_novel=args.novel)


if __name__ == "__main__":
    main()
