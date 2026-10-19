#!/usr/bin/env python3
"""
Automatisk beskæring og opdeling af 2x10 ark (20 scener) fra ChatGPT.

Tager et 1080x1920 (9:16) ark med 2 søjler og 10 rækker, beskærer hver af de 20 scener,
tilpasser dem automatisk til standard 2126 x 740 format med gennemsigtig baggrund,
og gemmer dem direkte i figurens scenes/ mappe!

Brug:
    python3 scripts/slice-sheet-2x10.py <sti-til-billede> [avatar_id]

Eksempel:
    python3 scripts/slice-sheet-2x10.py /home/pc/Downloads/10x2.png avatar_1
"""

import sys
import os
import json
from pathlib import Path
from PIL import Image

# Standard 2126 x 740 format (aspect ratio ~2.873)
TARGET_WIDTH = 2126
TARGET_HEIGHT = 740

# Rækkefølge af de 20 scener i 2x10 gitteret (2 søjler x 10 rækker)
# Slot index = row * 2 + col (0 til 19)
DEFAULT_SLOTS = [
    # Række 1
    {"key": "morgenmad", "title": "Morgenmad / Spisetid"},
    {"key": "rede_seng", "title": "Rede seng"},
    # Række 2
    {"key": "badetid", "title": "Badetid"},
    {"key": "boerste_taender", "title": "Børste tænder"},
    # Række 3
    {"key": "tage_toej_paa", "title": "Tage tøj på"},
    {"key": "medicin", "title": "Medicin"},
    # Række 4
    {"key": "kaffe", "title": "The & Kaffe"},
    {"key": "bolle", "title": "Bolle"},
    # Række 5
    {"key": "spisetid", "title": "Frokost / Spisetid"},
    {"key": "vaske_op", "title": "Vaske op"},
    # Række 6
    {"key": "vaesketoeg", "title": "Hænge vasketøj op"},
    {"key": "aktiviteter", "title": "Aktiviteter"},
    # Række 7
    {"key": "gatur", "title": "Gåtur"},
    {"key": "handle", "title": "Handle indkøb"},
    # Række 8
    {"key": "pause_sofa", "title": "Pause på sofa / TV"},
    {"key": "skraldespand", "title": "Skraldespand"},
    # Række 9
    {"key": "forberede_mad", "title": "Lave aftensmad"},
    {"key": "toej_af", "title": "Aftenhygiejne"},
    # Række 10
    {"key": "sengetid", "title": "Sengetid / Sove"},
    {"key": "weekend", "title": "Weekendhygge / Frisk luft"},
]

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
    print(f"✂️  Opdeler 2x10 Sceneark for: {avatar_id}")
    print(f"📁 Kildebillede: {sheet_file}")
    print(f"🎯 Gemmes i: {ref_scenes_dir}")
    print("========================================================\n")

    img = Image.open(sheet_file).convert("RGBA")
    total_w, total_h = img.size
    print(f"Original dimension: {total_w} x {total_h} pixels")

    col_w = total_w // 2
    row_h = total_h // 10

    saved_count = 0
    updated_scenes = {}

    for row in range(10):
        for col in range(2):
            idx = row * 2 + col
            slot = DEFAULT_SLOTS[idx]
            key = slot["key"]
            title = slot["title"]

            # Klip cellen ud
            x1 = col * col_w
            y1 = row * row_h
            x2 = (col + 1) * col_w
            y2 = (row + 1) * row_h

            cell = img.crop((x1, y1, x2, y2))
            bbox = cell.getbbox()

            if not bbox:
                print(f"[{idx+1:2d}/20] Row {row+1:2d}, Col {col+1}: Tom celle for '{key}' ({title}) — springes over")
                continue

            content = cell.crop(bbox)
            cw, ch = content.size

            # Skab mål-lærred i 2126 x 740 med 100% gennemsigtighed
            target_canvas = Image.new("RGBA", (TARGET_WIDTH, TARGET_HEIGHT), (0, 0, 0, 0))

            # Skaler med bevarelse af proportioner (Lanczos) med lidt luft i margin
            scale = min((TARGET_WIDTH - 80) / cw, (TARGET_HEIGHT - 60) / ch)
            new_w = max(1, int(cw * scale))
            new_h = max(1, int(ch * scale))
            resized = content.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Placer centreret
            paste_x = (TARGET_WIDTH - new_w) // 2
            paste_y = (TARGET_HEIGHT - new_h) // 2
            target_canvas.paste(resized, (paste_x, paste_y), resized)

            # Gem som WebP (højeste kvalitet, understøtter alfa)
            ref_out = ref_scenes_dir / f"{key}.webp"
            pub_out = pub_scenes_dir / f"{key}.webp"

            target_canvas.save(ref_out, "WEBP", quality=95)
            target_canvas.save(pub_out, "WEBP", quality=95)

            updated_scenes[key] = f"reference/personas/{avatar_id}/scenes/{key}.webp"
            saved_count += 1
            print(f"✓ [{idx+1:2d}/20] Gemte: {key}.webp ({title}) — oprindelig boks {cw}x{ch} px")

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

            with open(persona_json_path, "w", encoding="utf-8") as f:
                json.dump(pdata, f, indent=2, ensure_ascii=False)
            with open(pub_persona_dir / "persona.json", "w", encoding="utf-8") as f:
                json.dump(pdata, f, indent=2, ensure_ascii=False)
            print("\n🔄 Opdaterede persona.json med nye scener!")
        except Exception as e:
            print(f"Advarsel ved opdatering af persona.json: {e}")

    print(f"\n🎉 Færdig! Skar {saved_count} af 20 scener ud til {TARGET_WIDTH}x{TARGET_HEIGHT} WebP-format med gennemsigtig baggrund.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Brug: python3 scripts/slice-sheet-2x10.py <sti-til-billede> [avatar_id]")
        print("Eksempel: python3 scripts/slice-sheet-2x10.py /home/pc/Downloads/10x2.png avatar_1")
        sys.exit(1)

    sheet_arg = sys.argv[1]
    avatar_arg = sys.argv[2] if len(sys.argv) > 2 else "avatar_1"
    slice_sheet(sheet_arg, avatar_arg)
