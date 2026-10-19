#!/usr/bin/env python3
"""
Automatisk beskæring og opdeling af 2x10 ark (20 scener) fra ChatGPT.

Tager et 1080x1920 (9:16) ark med 2 søjler og 10 rækker, beskærer hver af de 20 scener
med præcise grænser og OpenCV-filtrering mod støj/stregrester,
tilpasser dem til standard 2126 x 740 format med 100% gennemsigtig baggrund,
og gemmer dem direkte i figurens scenes/ mapper!

Brug:
    python3 scripts/slice-sheet-2x10.py <sti-til-billede> [avatar_id]
"""

import sys
import os
import json
from pathlib import Path
import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

# Standard 2126 x 740 format (aspect ratio ~2.873)
TARGET_WIDTH = 2126
TARGET_HEIGHT = 740

# Præcis definition af de 19 distinkte scener i ChatGPT 2x10 arket
# (y1, y2, x1, x2)
CELL_DEFINITIONS = [
    # Række 1
    {
        "coords": (0, 187, 0, 465),
        "primary_key": "vaesketoeg",
        "aliases": ["vasketoj"],
        "title": "Hænge vasketøj op"
    },
    {
        "coords": (0, 188, 465, None),
        "primary_key": "kaffe",
        "aliases": ["the_kaffe"],
        "title": "The & Kaffe"
    },
    # Række 2
    {
        "coords": (188, 362, 0, 465),
        "primary_key": "medicin",
        "aliases": [],
        "title": "Medicin"
    },
    {
        "coords": (189, 360, 465, None),
        "primary_key": "badetid",
        "aliases": ["brusebad", "toej_af"],
        "title": "Badetid / Brusebad"
    },
    # Række 3
    {
        "coords": (363, 543, 0, 465),
        "primary_key": "spisetid",
        "aliases": ["aftensmad", "forberede_mad"],
        "title": "Aftensmad / Spisetid"
    },
    {
        "coords": (361, 540, 465, None),
        "primary_key": "boerste_taender",
        "aliases": ["borste_taender", "borste_tander", "tandborste"],
        "title": "Børste tænder"
    },
    # Række 4
    {
        "coords": (544, 709, 0, 465),
        "primary_key": "vaske_op",
        "aliases": ["opvask"],
        "title": "Vaske op"
    },
    {
        "coords": (541, 708, 465, None),
        "primary_key": "bolle",
        "aliases": ["bolle_ikon"],
        "title": "Bolle"
    },
    # Række 5
    {
        "coords": (709, 883, 465, None),
        "primary_key": "gatur",
        "aliases": ["gaatur"],
        "title": "Gåtur / Frisk luft"
    },
    # Række 6
    {
        "coords": (883, 1030, 0, 465),
        "primary_key": "sengetid",
        "aliases": ["sovetid", "sove"],
        "title": "Sengetid / Sove"
    },
    {
        "coords": (885, 1030, 465, None),
        "primary_key": "pause_sofa",
        "aliases": ["tv_skaerm", "sofa"],
        "title": "Pause på sofa / TV"
    },
    # Række 7
    {
        "coords": (1031, 1192, 0, 465),
        "primary_key": "rede_seng",
        "aliases": [],
        "title": "Rede seng"
    },
    {
        "coords": (1031, 1192, 465, None),
        "primary_key": "handle",
        "aliases": ["indkoeb"],
        "title": "Handle indkøb"
    },
    # Række 8
    {
        "coords": (1193, 1338, 0, 465),
        "primary_key": "skraldespand",
        "aliases": ["skrald"],
        "title": "Skraldespand & Pant"
    },
    {
        "coords": (1193, 1338, 465, None),
        "primary_key": "frokost",
        "aliases": [],
        "title": "Frokost / Rugbrød"
    },
    # Række 9
    {
        "coords": (1339, 1479, 0, 465),
        "primary_key": "morgenmad",
        "aliases": [],
        "title": "Morgenmad / Cereal & Juice"
    },
    {
        "coords": (1339, 1481, 465, None),
        "primary_key": "aktiviteter",
        "aliases": [],
        "title": "Aktiviteter / Hobby"
    },
    # Række 10
    {
        "coords": (1480, 1660, 0, 465),
        "primary_key": "cykeltur",
        "aliases": ["tage_toej_paa"],
        "title": "Cykeltur / Motion"
    },
    {
        "coords": (1482, 1660, 465, None),
        "primary_key": "weekend",
        "aliases": [],
        "title": "Weekendhygge / Hygge"
    },
]


def clean_cell_artifacts(cell_img: Image.Image) -> Image.Image:
    """Fjerner løsrevne støj-pixel og rester fra nabo-rækker vha. connected components."""
    if cv2 is None:
        return cell_img

    cell_arr = np.array(cell_img)
    alpha = cell_arr[:, :, 3]
    ch_h, ch_w = alpha.shape

    bin_alpha = (alpha > 10).astype(np.uint8)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(bin_alpha)

    cleaned_alpha = np.zeros_like(alpha)
    for lbl in range(1, num_labels):
        lx, ly, lw, lh, larea = stats[lbl]
        # Er det en kant-rest fra en anden række ved top eller bund?
        is_top_edge = (ly == 0) and (lh < 28) and (larea < 2500)
        is_bottom_edge = (ly + lh >= ch_h) and (lh < 28) and (larea < 2500)
        if not is_top_edge and not is_bottom_edge and larea > 50:
            cleaned_alpha[labels == lbl] = alpha[labels == lbl]

    cell_arr[:, :, 3] = cleaned_alpha
    return Image.fromarray(cell_arr)


def slice_sheet(sheet_path: str, avatar_id: str = "avatar_1"):
    sheet_file = Path(sheet_path).expanduser().resolve()
    if not sheet_file.exists():
        print(f"❌ Fejl: Fandt ikke billedfilen på: {sheet_file}")
        sys.exit(1)

    repo_root = Path(__file__).parent.parent
    ref_persona_dir = repo_root / "reference" / "personas" / avatar_id
    pub_persona_dir = repo_root / "public" / "reference" / "personas" / avatar_id

    ref_scenes_dir = ref_persona_dir / "scenes"
    pub_scenes_dir = pub_persona_dir / "scenes"

    ref_scenes_dir.mkdir(parents=True, exist_ok=True)
    pub_scenes_dir.mkdir(parents=True, exist_ok=True)

    print("\n========================================================")
    print(f"✂️  Opdeler og beskærer 2x10 Sceneark for: {avatar_id}")
    print(f"📁 Kildebillede: {sheet_file}")
    print(f"🎯 Gemmes i: {ref_scenes_dir}")
    print("========================================================\n")

    img = Image.open(sheet_file).convert("RGBA")
    total_w, total_h = img.size
    print(f"Original dimension: {total_w} x {total_h} pixels")

    saved_count = 0
    updated_scenes = {}

    for idx, cdef in enumerate(CELL_DEFINITIONS):
        y1, y2, x1, x2 = cdef["coords"]
        if x2 is None:
            x2 = total_w

        key = cdef["primary_key"]
        title = cdef["title"]
        aliases = cdef.get("aliases", [])

        # 1. Klip cellen ud
        cell = img.crop((x1, y1, x2, y2))

        # 2. Rens eventuelle støj-pixel fra tilstødende rækker
        cleaned = clean_cell_artifacts(cell)

        # 3. Find præcis bounding box for motivet
        bbox = cleaned.getbbox()
        if not bbox:
            print(f"[{idx+1:2d}/{len(CELL_DEFINITIONS)}] Tom celle for '{key}' ({title}) — springes over")
            continue

        content = cleaned.crop(bbox)
        cw, ch = content.size

        # 4. Skab mål-lærred i 2126 x 740 med 100% gennemsigtighed
        target_canvas = Image.new("RGBA", (TARGET_WIDTH, TARGET_HEIGHT), (0, 0, 0, 0))

        # 5. Skaler proportionelt med behagelig margen
        scale = min((TARGET_WIDTH - 120) / cw, (TARGET_HEIGHT - 80) / ch)
        new_w = max(1, int(cw * scale))
        new_h = max(1, int(ch * scale))
        resized = content.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 6. Centrer motivet på lærredet
        paste_x = (TARGET_WIDTH - new_w) // 2
        paste_y = (TARGET_HEIGHT - new_h) // 2
        target_canvas.paste(resized, (paste_x, paste_y), resized)

        # 7. Gem primær fil og synkroniser eventuelle aliaser
        all_keys = [key, *aliases]
        for k in all_keys:
            ref_out = ref_scenes_dir / f"{k}.webp"
            pub_out = pub_scenes_dir / f"{k}.webp"

            target_canvas.save(ref_out, "WEBP", quality=95)
            target_canvas.save(pub_out, "WEBP", quality=95)

            updated_scenes[k] = f"reference/personas/{avatar_id}/scenes/{k}.webp"

        saved_count += 1
        print(f"✓ [{idx+1:2d}/{len(CELL_DEFINITIONS)}] Gemte: {key}.webp ({title}) — oprindelig boks {cw}x{ch} px")

    # Opdater persona.json hvis den findes
    persona_json_path = ref_persona_dir / "persona.json"
    if persona_json_path.exists():
        try:
            with open(persona_json_path, "r", encoding="utf-8") as f:
                pdata = json.load(f)
            if "activityScenes" not in pdata:
                pdata["activityScenes"] = {}
            pdata["activityScenes"].update(updated_scenes)
            pdata["id"] = avatar_id
            pdata["name"] = avatar_id
            pdata["shortCode"] = avatar_id
            pdata["description"] = avatar_id

            with open(persona_json_path, "w", encoding="utf-8") as f:
                json.dump(pdata, f, indent=2, ensure_ascii=False)
            with open(pub_persona_dir / "persona.json", "w", encoding="utf-8") as f:
                json.dump(pdata, f, indent=2, ensure_ascii=False)
            print("\n🔄 Opdaterede persona.json med korrekte scener!")
        except Exception as e:
            print(f"Advarsel ved opdatering af persona.json: {e}")

    # Opdater også manifest-filer
    for mpath in [
        repo_root / "reference" / "personas" / "personas_manifest.json",
        repo_root / "public" / "reference" / "personas" / "personas_manifest.json",
    ]:
        if mpath.exists():
            try:
                with open(mpath, "r", encoding="utf-8") as f:
                    manifest = json.load(f)
                if isinstance(manifest, list):
                    item = next((p for p in manifest if p.get("id") == avatar_id), None)
                    if item:
                        item["name"] = avatar_id
                        item["shortCode"] = avatar_id
                        item["description"] = avatar_id
                        if "activityScenes" not in item:
                            item["activityScenes"] = {}
                        item["activityScenes"].update(updated_scenes)
                        with open(mpath, "w", encoding="utf-8") as f:
                            json.dump(manifest, f, indent=2, ensure_ascii=False)
            except Exception:
                pass

    print(f"\n🎉 Færdig! Skar {saved_count} scener ud til {TARGET_WIDTH}x{TARGET_HEIGHT} WebP-format med gennemsigtig baggrund.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Brug: python3 scripts/slice-sheet-2x10.py <sti-til-billede> [avatar_id]")
        sys.exit(1)

    sheet_arg = sys.argv[1]
    avatar_arg = sys.argv[2] if len(sys.argv) > 2 else "avatar_1"
    slice_sheet(sheet_arg, avatar_arg)
