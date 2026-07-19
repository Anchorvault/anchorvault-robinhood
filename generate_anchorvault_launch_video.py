import os
import textwrap
from typing import Dict, Optional, Tuple

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = r"E:\AnchorVault onchain stellar"
OUTPUT_DIR = os.path.join(ROOT, "generated")
OUTPUT_VIDEO = os.path.join(OUTPUT_DIR, "anchorvault_mainnet_launch_30s.mp4")

W, H = 1920, 1080
FPS = 30
SHOT_SECONDS = 5
SHOT_FRAMES = SHOT_SECONDS * FPS

SHOTS = [
    {
        "image": r"website phtoo\Screenshot 2026-06-07 003806.png",
        "title": "LIQUIDITY IS FRAGMENTED",
        "subtitle": "Billions in liquidity sit idle while global payment corridors remain disconnected.",
        "zoom": (1.00, 1.10),
        "pan": (-0.15, 0.10),
        "overlay_alpha": 165,
        "saturation": 0.8,
    },
    {
        "image": r"website phtoo\Screenshot 2026-06-07 003402.png",
        "title": "ANCHORVAULT IS LIVE",
        "subtitle": "Introducing AnchorVault. A trustless liquidity protocol built on Stellar Mainnet.",
        "zoom": (1.00, 1.06),
        "pan": (0.05, 0.02),
        "overlay_alpha": 95,
        "saturation": 1.05,
    },
    {
        "image": r"website phtoo\Screenshot 2026-06-07 003453.png",
        "title": "EARN ORGANIC YIELD",
        "subtitle": "Deposit stablecoins, power real settlement corridors, and earn yield from actual transaction activity.",
        "zoom": (1.00, 1.08),
        "pan": (0.10, 0.00),
        "overlay_alpha": 100,
        "saturation": 1.08,
    },
    {
        "image": r"website phtoo\Screenshot 2026-06-07 003721.png",
        "title": "REAL-WORLD SETTLEMENT",
        "subtitle": "AnchorVault connects on-chain liquidity directly to payment anchors and real-world settlement infrastructure.",
        "zoom": (1.00, 1.12),
        "pan": (-0.08, 0.06),
        "overlay_alpha": 105,
        "saturation": 1.05,
    },
    {
        "image": r"website phtoo\Screenshot 2026-06-07 003438.png",
        "title": "LIVE. TRANSPARENT. ON-CHAIN.",
        "subtitle": "Monitor performance in real time, track liquidity, and watch rewards compound directly on-chain.",
        "zoom": (1.00, 1.10),
        "pan": (0.12, 0.08),
        "overlay_alpha": 95,
        "saturation": 1.06,
    },
    {
        "image": None,
        "title": "BUILD THE FUTURE",
        "subtitle": "AnchorVault is live on Stellar Mainnet. Provide liquidity. Earn organic yield. Join the future of global payments.",
    },
]

FINAL_LINES = [
    "ANCHORVAULT",
    "LIVE ON STELLAR MAINNET",
    "www.anchorvault.xyz",
    "PROVIDE LIQUIDITY • EARN YIELD • POWER PAYMENTS",
]


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def resize_cover(img: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    tw, th = target_size
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def animated_bg(
    src: Image.Image,
    progress: float,
    zoom_range: Tuple[float, float],
    pan: Tuple[float, float],
    overlay_alpha: int,
    saturation: float,
    blur: float = 0.0,
) -> Image.Image:
    base = resize_cover(src, (W, H))
    if abs(saturation - 1.0) > 1e-3:
        base = ImageEnhance.Color(base).enhance(saturation)

    z0, z1 = zoom_range
    zoom = z0 + (z1 - z0) * progress
    zw, zh = int(W * zoom), int(H * zoom)
    zoomed = base.resize((zw, zh), Image.Resampling.LANCZOS)

    extra_x = max(0, zw - W)
    extra_y = max(0, zh - H)
    pan_x, pan_y = pan
    x = int(extra_x * (0.5 + pan_x * (progress - 0.5)))
    y = int(extra_y * (0.5 + pan_y * (progress - 0.5)))
    x = max(0, min(x, extra_x))
    y = max(0, min(y, extra_y))
    frame = zoomed.crop((x, y, x + W, y + H))

    if blur > 0:
        frame = frame.filter(ImageFilter.GaussianBlur(radius=blur))

    overlay = Image.new("RGBA", (W, H), (5, 7, 14, overlay_alpha))
    frame_rgba = frame.convert("RGBA")
    frame_rgba.alpha_composite(overlay)
    return frame_rgba.convert("RGB")


def draw_text_block(
    frame: Image.Image,
    title: str,
    subtitle: str,
    *,
    title_y: int = 790,
    subtitle_y: int = 890,
) -> Image.Image:
    draw = ImageDraw.Draw(frame)
    title_font = load_font(72, bold=True)
    subtitle_font = load_font(37, bold=False)
    small_font = load_font(28, bold=True)

    accent = (145, 93, 255)
    white = (245, 246, 250)
    muted = (205, 210, 225)
    shadow = (0, 0, 0)

    # Accent bar
    draw.rounded_rectangle((90, title_y - 32, 106, title_y + 130), radius=6, fill=accent)

    draw.text((130, title_y + 4), title, fill=shadow, font=title_font, stroke_width=3, stroke_fill=shadow)
    draw.text((130, title_y), title, fill=white, font=title_font)

    wrapped = textwrap.fill(subtitle, width=78)
    draw.text((130, subtitle_y), wrapped, fill=muted, font=subtitle_font)

    # Corner signature
    draw.text((W - 540, 52), "ANCHORVAULT MAINNET", fill=(210, 210, 220), font=small_font)
    draw.text((W - 228, 52), "LIVE", fill=accent, font=small_font)

    return frame


def find_logo() -> Optional[Image.Image]:
    candidates = [
        os.path.join(ROOT, r"branding ket\logo.png"),
        os.path.join(ROOT, r"public\logo.png"),
        os.path.join(ROOT, r"logo\4f88ce10-63c4-4ecf-b100-dadf6b56d9a8-removebg-preview.png"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return Image.open(path).convert("RGBA")
    return None


def render_final_shot(progress: float, logo: Optional[Image.Image]) -> Image.Image:
    frame = Image.new("RGB", (W, H), (2, 2, 6))
    draw = ImageDraw.Draw(frame)

    title_font = load_font(86, bold=True)
    mid_font = load_font(52, bold=True)
    small_font = load_font(36, bold=False)
    tiny_font = load_font(28, bold=True)

    glow_alpha = int(120 + 55 * progress)
    glow = Image.new("RGBA", (W, H), (20, 12, 45, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((520, 180, 1400, 860), fill=(128, 84, 255, glow_alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=120))
    frame = Image.alpha_composite(frame.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(frame)

    if logo is not None:
        logo_scale = 0.30 + (progress * 0.03)
        lw = int(logo.width * logo_scale)
        lh = int(logo.height * logo_scale)
        lresized = logo.resize((max(1, lw), max(1, lh)), Image.Resampling.LANCZOS)
        lx = (W - lresized.width) // 2
        ly = 170
        frame_rgba = frame.convert("RGBA")
        frame_rgba.alpha_composite(lresized, (lx, ly))
        frame = frame_rgba.convert("RGB")
        draw = ImageDraw.Draw(frame)

    draw.text((W // 2 - 280, 470), FINAL_LINES[0], fill=(250, 250, 252), font=title_font)
    draw.text((W // 2 - 350, 585), FINAL_LINES[1], fill=(198, 156, 255), font=mid_font)
    draw.text((W // 2 - 165, 675), FINAL_LINES[2], fill=(226, 226, 232), font=small_font)
    draw.text((W // 2 - 430, 760), FINAL_LINES[3], fill=(210, 214, 230), font=tiny_font)
    draw.text((W // 2 - 170, 860), "BUILD THE FUTURE", fill=(158, 98, 255), font=mid_font)

    return frame


def shot_frame(shot: Dict, progress: float, logo: Optional[Image.Image]) -> Image.Image:
    if shot["image"] is None:
        return render_final_shot(progress, logo)

    path = os.path.join(ROOT, shot["image"])
    src = Image.open(path).convert("RGB")
    frame = animated_bg(
        src=src,
        progress=progress,
        zoom_range=shot["zoom"],
        pan=shot["pan"],
        overlay_alpha=shot["overlay_alpha"],
        saturation=shot["saturation"],
        blur=1.5 if shot["title"] == "LIQUIDITY IS FRAGMENTED" else 0.0,
    )
    return draw_text_block(frame, shot["title"], shot["subtitle"])


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    logo = find_logo()

    writer = imageio.get_writer(
        OUTPUT_VIDEO,
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=1,
        ffmpeg_log_level="error",
    )

    total_frames = SHOT_FRAMES * len(SHOTS)
    frame_index = 0
    for shot_i, shot in enumerate(SHOTS, start=1):
        for f in range(SHOT_FRAMES):
            progress = f / max(1, SHOT_FRAMES - 1)
            frame = shot_frame(shot, progress, logo)
            writer.append_data(np.array(frame))
            frame_index += 1
        print(f"Rendered shot {shot_i}/{len(SHOTS)} ({frame_index}/{total_frames} frames)")

    writer.close()
    print(f"Video generated: {OUTPUT_VIDEO}")


if __name__ == "__main__":
    main()
