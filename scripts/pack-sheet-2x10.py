#!/usr/bin/env python3
"""
Pakker op til 20 individuelle 2126 x 740 scener sammen til ét 1080 x 1920 (9:16) ark ved 25% skalering.

Dette svarer præcist til metoden bag '/home/pc/Downloads/10x2.png', hvor 2126 x 740 scener
skaleres ned til 25% (~531.5 x 185 px) og placeres i 2 søjler x 10 rækker.

Brug:
    python3 scripts/pack-sheet-2x10.py [avatar_id] [output_sti]

Eksempel:
    python3 scripts/pack-sheet-2x10.py avatar_1 /home/pc/Downloads/avatar_1_sheet_10x2.png
"""

import sys
import os
from pathlib import Path
from PIL import Image

SHEET_WIDTH = 1080
SHEET_HEIGHT = 1920

COLS = 2
ROWS = 10

# Rækkefølge af de 20 scener i 2x10 gitteret
DEFAULT_SLOTS = [
    # Række 1
    {"key": "morgenmad", "aliases": ["morgenmad", "morgen", "spisetid"]},
    {"key": "rede_seng", "aliases": ["rede_seng", "seng"]},
    # Række 2
    {"key": "badetid", "aliases": ["badetid", "bad"]},
    {"key": "boerste_taender", "aliases": ["boerste_taender", "tandboerste", "taender"]},
    # Række 3
    {"key": "tage_toej_paa", "aliases": ["tage_toej_paa", "toej"]},
    {"key": "medicin", "aliases": ["medicin", "piller"]},
    # Række 4
    {"key": "kaffe", "aliases": ["kaffe", "the_kaffe", "kop"]},
    {"key": "bolle", "aliases": ["bolle", "snack"]},
    # Række 5
    {"key": "spisetid", "aliases": ["spisetid", "frokost", "aftensmad"]},
    {"key": "vaske_op", "aliases": ["vaske_op", "opvask"]},
    # Række 6
    {"key": "vaesketoeg", "aliases": ["vaesketoeg", "vasketoj", "vasketøj"]},
    {"key": "aktiviteter", "aliases": ["aktiviteter", "hobby", "musik"]},
    # Række 7
    {"key": "gatur", "aliases": ["gatur", "gaatur"]},
    {"key": "handle", "aliases": ["handle", "indkoeb", "indkøb"]},
    # Række 8
    {"key": "pause_sofa", "aliases": ["pause_sofa", "sofa", "pause", "tv"]},
    {"key": "skraldespand", "aliases": ["skraldespand", "skrald"]},
    # Række 9
    {"key": "forberede_mad", "aliases": ["forberede_mad", "madlavning", "aftensmad"]},
    {"key": "toej_af", "aliases": ["toej_af", "aftenhygiejne", "nattoej"]},
    # Række 10
    {"key": "sengetid", "aliases": ["sengetid", "sovetid", "sove"]},
    {"key": "weekend", "aliases": ["weekend", "weekendhygge"]},
]

def pack_sheet(avatar_id: str = "avatar_1", output_path: str = None):
    repo_root = Path(__file__).parent.parent
    scenes_dir = repo_root / "reference" / "personas" / avatar_id / "scenes"

    if not scenes_dir.exists():
        print(f"❌ Fejl: Fandt ikke scenemappen: {scenes_dir}")
        sys.exit(1)

    if not output_path:
        output_file = repo_root / "reference" / "personas" / avatar_id / "sheet_2x10.png"
    else:
        output_file = Path(output_path).expanduser().resolve()

    print("\n========================================================")
    print(f"📦 Pakker 2x10 Sceneark (25% Skalering) for: {avatar_id}")
    print(f"📁 Scenekilde: {scenes_dir}")
    print(f"🎯 Output ark: {output_file} ({SHEET_WIDTH} x {SHEET_HEIGHT} px)")
    print("========================================================\n")

    sheet = Image.new("RGBA", (SHEET_WIDTH, SHEET_HEIGHT), (0, 0, 0, 0))

    cell_w = SHEET_WIDTH // COLS    # 540
    cell_h = SHEET_HEIGHT // ROWS   # 192

    # Find alle filer i scenemappen
    available_files = list(scenes_dir.glob("*.webp")) + list(scenes_dir.glob("*.png"))
    file_map = {f.stem.lower(): f for f in available_files}

    packed_count = 0

    for row in range(ROWS):
        for col in range(COLS):
            idx = row * COLS + col
            slot = DEFAULT_SLOTS[idx]
            key = slot["key"]

            # Søg efter matchende scene-fil
            target_file = None
            for alias in slot["aliases"]:
                if alias in file_map:
                    target_file = file_map[alias]
                    break

            if not target_file:
                print(f"[{idx+1:2d}/20] Row {row+1:2d}, Col {col+1}: '{key}' ikke fundet — felt forbliver tomt")
                continue

            try:
                scene_img = Image.open(target_file).convert("RGBA")
                # Skaler til præcis 25%
                scaled_w = max(1, int(round(scene_img.width * 0.25)))
                scaled_h = max(1, int(round(scene_img.height * 0.25)))

                # Hvis billedet overskrider cellens dimensioner, tilpas det proportionelt
                if scaled_w > cell_w or scaled_h > cell_h:
                    scale_factor = min(cell_w / scaled_w, cell_h / scaled_h)
                    scaled_w = max(1, int(scaled_w * scale_factor))
                    scaled_h = max(1, int(scaled_h * scale_factor))

                resized = scene_img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)

                # Centrer inde i cellen
                cell_left = col * cell_w
                cell_top = row * cell_h

                paste_x = cell_left + (cell_w - scaled_w) // 2
                paste_y = cell_top + (cell_h - scaled_h) // 2

                sheet.paste(resized, (paste_x, paste_y), resized)
                packed_count += 1
                print(f"✓ [{idx+1:2d}/20] Row {row+1:2d}, Col {col+1}: Pakkede '{key}' ({scaled_w}x{scaled_h} px)")
            except Exception as e:
                print(f"❌ Fejl ved behandling af '{key}' ({target_file}): {e}")

    output_file.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output_file, "PNG")
    print(f"\n🎉 Færdig! Pakkede {packed_count} scener ind i 1080x1920 arket:")
    print(f"💾 Gemt som: {output_file}\n")

if __name__ == "__main__":
    avatar_arg = sys.argv[1] if len(sys.argv) > 1 else "avatar_1"
    out_arg = sys.argv[2] if len(sys.argv) > 2 else None
    pack_sheet(avatar_arg, out_arg)
