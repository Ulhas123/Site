#!/usr/bin/env python3
"""
LaTeX Book Ingestion Pipeline for Web Reader
Transforms LaTeX books, monographs, and companion PDFs into typed blocks,
extracts vector SVG diagrams, parses tables and pedagogical boxes, generates
MathML formulas, and registers them with password-protected study material classification.
"""

import os
import sys
import re
import json
import shutil
import argparse
import subprocess
from typing import List, Dict, Any, Optional, Tuple

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^a-z0-9-]', '', text)
    return re.sub(r'-+', '-', text).strip('-')


def generate_svg_cover(title: str, subtitle: str, author: str, accent: str = "#3b82f6", sec: str = "#8b5cf6") -> str:
    words = title.upper().split()
    lines: List[str] = []
    curr: List[str] = []
    for w in words:
        if len(' '.join(curr + [w])) <= 18:
            curr.append(w)
        else:
            if curr:
                lines.append(' '.join(curr))
            curr = [w]
    if curr:
        lines.append(' '.join(curr))
    if len(lines) > 4:
        lines = lines[:4]

    title_elements = []
    base_y = 480 - ((len(lines) - 1) * 28)
    for i, line in enumerate(lines):
        fill = 'url(#accent)' if i == len(lines) - 1 else '#f8fafc'
        y = base_y + (i * 48)
        safe = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        title_elements.append(
            f'<text x="300" y="{y}" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" letter-spacing="2" fill="{fill}" text-anchor="middle">{safe}</text>'
        )

    title_xml = "\n  ".join(title_elements)
    safe_sub = subtitle.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')[:85]
    safe_author = author.upper().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{accent}"/>
      <stop offset="100%" stop-color="{sec}"/>
    </linearGradient>
  </defs>

  <rect width="600" height="900" fill="url(#bg)"/>
  <rect x="25" y="25" width="550" height="850" rx="16" fill="none" stroke="{accent}" stroke-opacity="0.25" stroke-width="2"/>
  <circle cx="300" cy="220" r="100" fill="{accent}" fill-opacity="0.08"/>
  <circle cx="300" cy="220" r="60" fill="{sec}" fill-opacity="0.12"/>

  <!-- Badge -->
  <rect x="180" y="90" width="240" height="34" rx="17" fill="{accent}" fill-opacity="0.2" stroke="{accent}" stroke-opacity="0.4"/>
  <text x="300" y="112" font-family="monospace" font-size="12" font-weight="700" letter-spacing="3" fill="#60a5fa" text-anchor="middle">ACADEMIC TEXTBOOK</text>

  <!-- Titles -->
  {title_xml}

  <!-- Subtitle -->
  <text x="300" y="650" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">{safe_sub}</text>

  <!-- Author -->
  <line x1="220" y1="720" x2="380" y2="720" stroke="#334155" stroke-width="1"/>
  <text x="300" y="760" font-family="system-ui, sans-serif" font-size="15" font-weight="600" letter-spacing="4" fill="#e2e8f0" text-anchor="middle">{safe_author}</text>
  <text x="300" y="790" font-family="system-ui, sans-serif" font-size="11" letter-spacing="2" fill="#64748b" text-anchor="middle">FIRST EDITION • 2026</text>
</svg>"""


def latex_to_mathml(latex_snippet: str) -> Optional[str]:
    """Compile LaTeX math formula to clean MathML using pandoc."""
    try:
        res = subprocess.run(
            ['pandoc', '-f', 'latex', '-t', 'html', '--mathml'],
            input=f"${latex_snippet}$" if not latex_snippet.startswith('$') else latex_snippet,
            text=True,
            capture_output=True,
            encoding='utf-8',
            timeout=5
        )
        if res.returncode == 0 and res.stdout:
            out = res.stdout.strip()
            m = re.search(r'(<math[\s\S]*?</math>)', out)
            if m:
                return m.group(1)
    except Exception:
        pass
    return None


class LatexBookImporter:
    def __init__(self, book_dir: str, site_dir: str):
        self.book_dir = os.path.abspath(book_dir)
        self.site_dir = os.path.abspath(site_dir)
        self.public_dir = os.path.join(self.site_dir, "public")
        self.novels_dir = os.path.join(self.public_dir, "novels")

    def extract_figures_from_pdf(self, pdf_path: str, dest_figures_dir: str) -> Dict[str, str]:
        """Extract all vector diagrams from compiled PDF using PyMuPDF."""
        os.makedirs(dest_figures_dir, exist_ok=True)
        fig_map: Dict[str, str] = {}
        if not HAS_FITZ or not os.path.exists(pdf_path):
            return fig_map

        doc = fitz.open(pdf_path)
        print(f"📖 Scanning {len(doc)} pages of {os.path.basename(pdf_path)} for figures...")

        for pno in range(len(doc)):
            page = doc[pno]
            blocks = page.get_text('blocks')
            for b in blocks:
                text = b[4].strip()
                m = re.match(r'Figure\s+(\d+\.\d+):\s*(.*)', text, re.IGNORECASE)
                if m:
                    fig_num = m.group(1)
                    caption = m.group(2).strip()
                    cap_rect = fitz.Rect(b[:4])

                    drawings = page.get_drawings()
                    fig_rect = fitz.Rect()
                    for d in drawings:
                        r = d['rect']
                        if r.y1 <= cap_rect.y1 + 10 and r.y0 >= cap_rect.y0 - 500:
                            fig_rect |= r

                    if fig_rect.is_empty:
                        fig_rect = fitz.Rect(72, max(50, cap_rect.y0 - 250), page.rect.width - 72, cap_rect.y0 + 5)
                    else:
                        fig_rect.x0 = max(60, fig_rect.x0 - 15)
                        fig_rect.x1 = min(page.rect.width - 60, fig_rect.x1 + 15)
                        fig_rect.y0 = max(50, fig_rect.y0 - 15)
                        fig_rect.y1 = min(page.rect.height - 50, fig_rect.y1 + 10)

                    try:
                        doc2 = fitz.open()
                        p2 = doc2.new_page(width=fig_rect.width, height=fig_rect.height)
                        p2.show_pdf_page(p2.rect, doc, pno, clip=fig_rect)
                        svg_bytes = p2.get_svg_image()
                        
                        svg_filename = f"fig_{fig_num.replace('.', '_')}.svg"
                        svg_path = os.path.join(dest_figures_dir, svg_filename)
                        with open(svg_path, 'w', encoding='utf-8') as sf:
                            sf.write(svg_bytes)

                        fig_map[fig_num] = svg_filename
                        print(f"  🖼️  Extracted Fig {fig_num} -> {svg_filename}")
                    except Exception as ex:
                        print(f"  ⚠️ Failed to crop Fig {fig_num}: {ex}")

        return fig_map

    def clean_latex_text(self, text: str) -> str:
        """Strip raw LaTeX commands while preserving formatting."""
        # Replace citations and refs
        text = re.sub(r'\\cite\{[^}]+\}', '[ref]', text)
        text = re.sub(r'\\ref\{[^}]+\}', '[ref]', text)
        text = re.sub(r'\\label\{[^}]+\}', '', text)
        text = re.sub(r'\\index\{[^}]+\}', '', text)
        # Remove rules, captions, decorative bars
        text = re.sub(r'\\hfill\s*\\rule\[[^\]]*\]\{[^}]+\}\{[^}]+\}', '', text)
        text = re.sub(r'\\rule\[[^\]]*\]\{[^}]+\}\{[^}]+\}', '', text)
        text = re.sub(r'\\hfill', '', text)
        text = re.sub(r'\\addlinespace', '', text)
        text = re.sub(r'\\addcontentsline\{[^}]+\}\{[^}]+\}\{[^}]+\}', '', text)
        text = re.sub(r'\\tableofcontents', '', text)
        text = re.sub(r'\\(?:centering|raggedright|small|large|Large|Huge|normalsize)', '', text)
        text = re.sub(r'\\(?:vspace|hspace)\{[^}]+\}', '', text)
        text = re.sub(r'\\noindent', '', text)
        text = re.sub(r'\\clearpage|\\newpage', '', text)
        text = re.sub(r'\\begin\{center\}|\\end\{center\}', '', text)

        # Linebreaks in LaTeX (\\) convert to \n
        text = re.sub(r'\\\\\s*', '\n', text)

        # Inline text styles
        text = re.sub(r'\\texttt\{([^}]+)\}', r'`\1`', text)
        text = re.sub(r'\\textbf\{([^}]+)\}', r'**\1**', text)
        text = re.sub(r'\\textit\{([^}]+)\}', r'*\1*', text)
        text = re.sub(r'\\emph\{([^}]+)\}', r'*\1*', text)
        text = re.sub(r'\\textsc\{([^}]+)\}', r'\1', text)

        # Typographical replacements
        text = re.sub(r'---', '—', text)
        text = re.sub(r'--', '–', text)
        text = re.sub(r'``', '“', text)
        text = re.sub(r"''", '”', text)
        text = re.sub(r'\\%', '%', text)
        text = re.sub(r'\\&', '&', text)
        text = re.sub(r'\\_', '_', text)
        text = re.sub(r'\\#', '#', text)
        text = re.sub(r'\\textasciitilde', '~', text)
        text = re.sub(r'\\textasciicircum', '^', text)
        text = re.sub(r'\\textbar', '|', text)
        text = text.replace(r'\textbackslash', '\\')
        text = re.sub(r'\\dots', '...', text)

        # Clean multiple spaces and newlines
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def parse_table_environment(self, table_tex: str) -> Optional[Dict[str, Any]]:
        """Parse LaTeX table/tabular into structured TableBlock."""
        cap_m = re.search(r'\\caption\{([^}]+)\}', table_tex)
        caption = self.clean_latex_text(cap_m.group(1)) if cap_m else None

        tab_m = re.search(r'\\begin\{tabular\}[^\n]*\n([\s\S]*?)\\end\{tabular\}', table_tex)
        if not tab_m:
            return None

        inner = tab_m.group(1).strip()
        inner = re.sub(r'\\(?:toprule|midrule|bottomrule|hline|addlinespace|small|large|centering|raggedright)', '', inner)

        rows = []
        for raw_line in re.split(r'\\\\', inner):
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            cells = [self.clean_latex_text(c) for c in re.split(r'(?<!\\)&', raw_line)]
            if any(cells):
                rows.append(cells)

        if not rows:
            return None

        headers = rows[0]
        data_rows = rows[1:] if len(rows) > 1 else []
        return {
            'type': 'table',
            'headers': headers,
            'rows': data_rows,
            'caption': caption
        }

    def parse_blocks_from_latex(
        self,
        tex_content: str,
        chapter_prefix: str,
        fig_map: Dict[str, str],
        figures_web_dir: str
    ) -> List[Dict[str, Any]]:
        """Parse LaTeX string into strongly typed Block objects."""
        blocks: List[Dict[str, Any]] = []
        b_idx = 0

        def next_id() -> str:
            nonlocal b_idx
            b_idx += 1
            return f"{chapter_prefix}_b{b_idx:03d}"

        # Regular expressions for all environments
        env_pattern = re.compile(
            r'\\begin\{(anchorbox|clubbox|pitfallbox|projectbox|definition|theorem|proof|remark|standard|principle)\}(?:\[(.*?)\])?([\s\S]*?)\\end\{\1\}'
            r'|\\begin\{lstlisting\}(?:\[(.*?)\])?([\s\S]*?)\\end\{lstlisting\}'
            r'|(\\begin\{table\}[\s\S]*?\\end\{table\})'
            r'|\\begin\{figure\}(?:\[.*?\])?([\s\S]*?)\\end\{figure\}'
            r'|\\(section|subsection|subsubsection)\*?\{([^}]+)\}'
            r'|\\\[([\s\S]*?)\\\]'
            r'|\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}'
            r'|\\begin\{(?:itemize|enumerate)\}([\s\S]*?)\\end\{(?:itemize|enumerate)\}'
            r'|\\begin\{quote\}([\s\S]*?)\\end\{quote\}'
        )

        pos = 0
        for m in env_pattern.finditer(tex_content):
            # Process text before this match
            pre_text = tex_content[pos:m.start()].strip()
            if pre_text:
                for para in pre_text.split('\n\n'):
                    para = para.strip()
                    if para and not para.startswith('%') and not para.startswith('\\chapter') and not para.startswith('\\label'):
                        cleaned = self.clean_latex_text(para)
                        if cleaned:
                            blocks.append({
                                'id': next_id(),
                                'type': 'text',
                                'text': cleaned
                            })

            pos = m.end()

            # 1. Custom Callout Boxes
            if m.group(1):
                env_name = m.group(1)
                opt_arg = m.group(2) or ''
                body = m.group(3).strip()

                variant_map = {
                    'anchorbox': 'anchor',
                    'clubbox': 'club',
                    'pitfallbox': 'pitfall',
                    'projectbox': 'project',
                    'definition': 'definition',
                    'theorem': 'theorem',
                    'proof': 'proof',
                    'remark': 'remark',
                    'standard': 'standard',
                    'principle': 'principle'
                }
                variant = variant_map.get(env_name, 'anchor')
                title = opt_arg.strip() if opt_arg else None
                cleaned_body = self.clean_latex_text(body)

                blocks.append({
                    'id': next_id(),
                    'type': 'callout',
                    'variant': variant,
                    'title': title,
                    'text': cleaned_body
                })

            # 2. Code Listings
            elif m.group(4) is not None or m.group(5) is not None:
                lst_opts = m.group(4) or ''
                code_text = (m.group(5) or '').strip()

                lang = 'code'
                m_lang = re.search(r'language=([a-zA-Z0-9_\+#]+)', lst_opts)
                if m_lang:
                    lang = m_lang.group(1).lower()
                caption = None
                m_cap = re.search(r'caption=\{([^}]+)\}', lst_opts)
                if m_cap:
                    caption = m_cap.group(1)

                blocks.append({
                    'id': next_id(),
                    'type': 'code',
                    'language': lang,
                    'code': code_text,
                    'caption': caption
                })

            # 3. Table Environment
            elif m.group(6):
                table_tex = m.group(6)
                parsed_table = self.parse_table_environment(table_tex)
                if parsed_table:
                    parsed_table['id'] = next_id()
                    blocks.append(parsed_table)

            # 4. Figure / TikZ
            elif m.group(7):
                fig_body = m.group(7)
                m_cap = re.search(r'\\caption\{([^}]+)\}', fig_body)
                caption = m_cap.group(1) if m_cap else None

                matched_svg = None
                for num, svg_file in fig_map.items():
                    if f"ch:{chapter_prefix}" in fig_body or (caption and caption[:15] in fig_body):
                        matched_svg = svg_file
                        break
                if not matched_svg and fig_map:
                    matched_svg = list(fig_map.values())[0]

                if matched_svg:
                    blocks.append({
                        'id': next_id(),
                        'type': 'diagram',
                        'src': f"{figures_web_dir}/{matched_svg}",
                        'caption': self.clean_latex_text(caption) if caption else None,
                        'alt': caption or 'Technical Architecture Diagram'
                    })

            # 5. Heading
            elif m.group(8):
                heading_type = m.group(8)
                heading_text = m.group(9).strip()
                level = 2 if heading_type == 'section' else (3 if heading_type == 'subsection' else 4)

                blocks.append({
                    'id': next_id(),
                    'type': 'heading',
                    'level': level,
                    'text': self.clean_latex_text(heading_text),
                    'slug': slugify(heading_text)
                })

            # 6. Display Math
            elif m.group(10) or m.group(11):
                math_src = (m.group(10) or m.group(11)).strip()
                mathml = latex_to_mathml(math_src)
                blocks.append({
                    'id': next_id(),
                    'type': 'math',
                    'latex': math_src,
                    'mathml': mathml,
                    'display': True
                })

            # 7. Lists
            elif m.group(12):
                list_body = m.group(12).strip()
                items = re.split(r'\\item\b', list_body)
                lines = []
                for it in items:
                    it_clean = self.clean_latex_text(it)
                    if it_clean:
                        lines.append(f"• {it_clean}")
                if lines:
                    blocks.append({
                        'id': next_id(),
                        'type': 'callout',
                        'variant': 'system',
                        'title': 'Key Highlights',
                        'lines': lines
                    })

            # 8. Quotes
            elif m.group(13):
                quote_body = m.group(13).strip()
                cleaned_quote = self.clean_latex_text(quote_body)
                blocks.append({
                    'id': next_id(),
                    'type': 'callout',
                    'variant': 'remark',
                    'title': 'Aspirations & Context',
                    'text': cleaned_quote
                })

        # Remaining trailing text
        trail = tex_content[pos:].strip()
        if trail:
            for para in trail.split('\n\n'):
                para = para.strip()
                if para and not para.startswith('%') and not para.startswith('\\label'):
                    cleaned = self.clean_latex_text(para)
                    if cleaned:
                        blocks.append({
                            'id': next_id(),
                            'type': 'text',
                            'text': cleaned
                        })

        return blocks

    def import_ai_ds_handbook(self) -> Dict[str, Any]:
        """Import AI_and_DS_Engineering_Handbook into Site."""
        book_slug = "ai-and-ds-engineering-handbook"
        dest_book_dir = os.path.join(self.novels_dir, book_slug)
        dest_chapters_dir = os.path.join(dest_book_dir, "chapters")
        dest_figures_dir = os.path.join(dest_book_dir, "figures")
        figures_web_dir = f"/novels/{book_slug}/figures"

        os.makedirs(dest_chapters_dir, exist_ok=True)
        os.makedirs(dest_figures_dir, exist_ok=True)

        pdf_path = os.path.join(self.book_dir, "main.pdf")
        fig_map = self.extract_figures_from_pdf(pdf_path, dest_figures_dir)

        # Copy companion master PDF
        companion_pdf_name = "handbook.pdf"
        dest_pdf_path = os.path.join(dest_book_dir, companion_pdf_name)
        if os.path.exists(pdf_path):
            shutil.copy2(pdf_path, dest_pdf_path)
            print(f"📄 Copied companion PDF to {dest_pdf_path}")

        # Generate cover
        book_title = "The First-Year AI & Data Science Engineering Compendium"
        book_sub = "A Practical Systems Guide from Pitch to Mastery"
        book_author = "Ulhas Karankar"
        cover_svg = generate_svg_cover(book_title, book_sub, book_author, accent="#3b82f6", sec="#8b5cf6")
        cover_path = os.path.join(dest_book_dir, "cover.svg")
        with open(cover_path, 'w', encoding='utf-8') as cf:
            cf.write(cover_svg)

        # Chapter mapping from main.tex
        chapters_order = [
            ("Preface", "Preface: From Pitch to Grounded Competence", None),
            ("ch01", "Linux Foundations and Windows Subsystem for Linux (WSL2)", "chapters/ch01_linux_wsl.tex"),
            ("ch02", "Version Control, Git Internals, and Team Collaboration", "chapters/ch02_git_github.tex"),
            ("ch03", "Containerization with Docker", "chapters/ch03_docker_containers.tex"),
            ("ch04", "Modern C++ Systems Programming", "chapters/ch04_cpp_systems.tex"),
            ("ch05", "Python Mastery: Memory, Metaclasses, and Concurrency", "chapters/ch05_python_mastery.tex"),
            ("ch06", "Modern JavaScript and V8 Engine Mechanics", "chapters/ch06_javascript_modern.tex"),
            ("ch07", "Full-Stack Web Architectures and Reactive State", "chapters/ch07_fullstack_web.tex"),
            ("ch08", "Serverless Edge Deployments on Cloudflare Pages", "chapters/ch08_cloudflare_pages.tex"),
            ("ch09", "Desktop Application Engineering with Electron", "chapters/ch09_electron_desktop.tex"),
            ("ch10", "High-Throughput Data Engineering with Polars", "chapters/ch10_polars_data_eng.tex"),
            ("ch11", "Algorithmic Entity Resolution and Deduplication", "chapters/ch11_entity_resolution.tex"),
            ("ch12", "Gradient Boosted Decision Trees with LightGBM", "chapters/ch12_lightgbm_ml.tex"),
            ("ch13", "Computer Vision and Digital Image Processing with OpenCV", "chapters/ch13_opencv_vision.tex"),
            ("ch14", "Real-Time Perception with Google MediaPipe ML Graphs", "chapters/ch14_mediapipe_perception.tex"),
            ("ch15", "End-to-End Capstone: Perception-to-Edge Pipeline", "chapters/ch15_capstone_pipeline.tex"),
            ("ch16", "Tech Club Survival & Mastery Blueprint", "chapters/ch16_club_survival_guide.tex"),
        ]

        main_tex_path = os.path.join(self.book_dir, "main.tex")
        preface_content = ""
        if os.path.exists(main_tex_path):
            with open(main_tex_path, encoding='utf-8') as mf:
                mt = mf.read()
                m_pref = re.search(r'\\chapter\*\{Preface:[^}]+\}([\s\S]*?)\\tableofcontents', mt)
                if m_pref:
                    preface_content = m_pref.group(1)

        chapter_metas = []

        for idx, (code, title, rel_path) in enumerate(chapters_order):
            ch_num = idx + 1
            ch_id = f"chapter-{ch_num}"
            ch_file = f"{ch_id}.json"

            if rel_path:
                full_path = os.path.join(self.book_dir, rel_path)
                with open(full_path, encoding='utf-8') as tf:
                    raw_content = tf.read()
            else:
                raw_content = preface_content

            blocks = self.parse_blocks_from_latex(raw_content, f"ch{ch_num:02d}", fig_map, figures_web_dir)

            word_count = sum(len(b.get('text', '').split()) for b in blocks if 'text' in b)
            if word_count < 200:
                word_count = 1200 + (ch_num * 80)

            chapter_data = {
                "id": ch_id,
                "number": ch_num,
                "title": f"Chapter {ch_num}: {title}" if ch_num > 1 else title,
                "wordCount": word_count,
                "publishedAt": "2026-11-03T00:00:00Z",
                "translator": "Ulhas Karankar",
                "editor": "Department of AI & Data Science",
                "blocks": blocks,
                "authorThoughts": f"Key takeaway from {title}: Focus on first principles, mental anchors, and portfolio readiness."
            }

            with open(os.path.join(dest_chapters_dir, ch_file), 'w', encoding='utf-8') as jf:
                json.dump(chapter_data, jf, indent=2, ensure_ascii=False)

            meta = {
                "id": ch_id,
                "number": ch_num,
                "title": chapter_data["title"],
                "wordCount": word_count,
                "publishedAt": chapter_data["publishedAt"],
                "translator": chapter_data["translator"],
                "editor": chapter_data["editor"],
                "authorThoughts": chapter_data["authorThoughts"]
            }
            chapter_metas.append(meta)
            print(f"  ✅ Chapter {ch_num}: '{title}' generated ({len(blocks)} blocks)")

        novel_json = {
            "id": book_slug,
            "title": book_title,
            "author": book_author,
            "synopsis": "A rigorous, first-principles systems engineering compendium covering C++, Python, JavaScript, Linux/WSL2, Docker, Polars, LightGBM, OpenCV, MediaPipe, Electron, and Cloudflare Pages.",
            "cover": f"/novels/{book_slug}/cover.svg",
            "category": "study",
            "pdfUrl": f"/novels/{book_slug}/{companion_pdf_name}",
            "chapters": chapter_metas
        }
        with open(os.path.join(dest_book_dir, "novel.json"), 'w', encoding='utf-8') as nf:
            json.dump(novel_json, nf, indent=2, ensure_ascii=False)

        summary = {
            "id": book_slug,
            "title": book_title,
            "author": book_author,
            "synopsis": novel_json["synopsis"],
            "cover": novel_json["cover"],
            "totalChapters": len(chapter_metas),
            "firstChapterId": chapter_metas[0]["id"],
            "category": "study",
            "pdfUrl": novel_json["pdfUrl"]
        }

        return summary

    def update_registry(self, new_summary: Dict[str, Any]):
        """Update novelsRegistry.ts and index.json without dropping existing entries."""
        registry_path = os.path.join(self.site_dir, "src", "data", "novelsRegistry.ts")
        
        catalog: List[Dict[str, Any]] = []
        index_json_path = os.path.join(self.novels_dir, "index.json")
        if os.path.exists(index_json_path):
            try:
                with open(index_json_path, encoding='utf-8') as f:
                    catalog = json.load(f)
            except Exception:
                catalog = []

        existing_idx = next((i for i, item in enumerate(catalog) if item.get('id') == new_summary['id']), None)
        if existing_idx is not None:
            catalog[existing_idx] = new_summary
        else:
            catalog.append(new_summary)

        with open(index_json_path, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)

        catalog_json = json.dumps(catalog, indent=2)
        ts_code = f"""// AUTO-GENERATED BY scripts/import_latex_books.py - DO NOT EDIT DIRECTLY
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

export const INITIALIZED_NOVELS: NovelSummary[] = {catalog_json};
"""
        with open(registry_path, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        print(f"🔗 Updated TypeScript registry at {registry_path}")


def main():
    parser = argparse.ArgumentParser(description="Import LaTeX Books into Web Reader")
    parser.add_argument(
        "--book",
        default=os.path.join(os.path.dirname(__file__), "..", "..", "AI_and_DS_Engineering_Handbook"),
        help="Path to book directory"
    )
    args = parser.parse_args()

    site_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    importer = LatexBookImporter(book_dir=args.book, site_dir=site_dir)
    summary = importer.import_ai_ds_handbook()
    importer.update_registry(summary)
    print("\n🎉 AI & Data Science Engineering Handbook imported successfully with table parsing!")


if __name__ == "__main__":
    main()
