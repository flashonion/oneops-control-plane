from __future__ import annotations

import math
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CAPTURES = ROOT / "demo-captures"
OUTPUT = ROOT / "artifacts" / "oneops-hackathon-demo-v1.1.1.mp4"
WIDTH, HEIGHT, FPS = 1280, 720, 24
BLUE = (45, 108, 237)
GREEN = (57, 189, 140)
INK = (16, 25, 34)


@dataclass(frozen=True)
class Scene:
    image: str
    duration: float
    title: str
    subtitle: str
    focal_x: float = 0.5
    focal_y: float = 0.5
    mode: str = "screen"


SCENES = [
    Scene("01-workplace.png", 5.0, "ONEOPS", "One operational view for every IT system", mode="title"),
    Scene("01-workplace.png", 10.0, "Your workplace, live", "See the person, workstation, presence, and risk at every desk.", 0.60, 0.48),
    Scene("02-device.png", 10.0, "One device record", "Intune, Atera, ScreenConnect, and Snip-IP evidence reconciled in context.", 0.73, 0.46),
    Scene("03-ticket.png", 9.0, "From desk to incident", "The urgent BitLocker ticket is already linked to Mia and SYD-LT-042.", 0.75, 0.48),
    Scene("04-harbour.png", 8.0, "Built for multi-company IT", "Switch company scope and the office, people, and devices change together.", 0.58, 0.48),
    Scene("05-integrations.png", 9.0, "A secure data fabric", "Provider credentials stay server-side while sync health stays visible.", 0.58, 0.46),
    Scene("06-review.png", 8.0, "Human review where identity is uncertain", "OneOps explains match confidence before records are merged.", 0.58, 0.48),
    Scene("07-mobile.png", 9.0, "The same context, anywhere", "Responsive operations for an on-call team, with safe action boundaries.", mode="mobile"),
    Scene("01-workplace.png", 5.0, "ONEOPS", "See the office as it is. Run IT as one system.", mode="outro"),
]


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


FONT_TITLE = font("seguisb.ttf", 42)
FONT_SUBTITLE = font("segoeui.ttf", 21)
FONT_BRAND = font("seguisb.ttf", 64)
FONT_SMALL = font("seguisb.ttf", 16)


def cover(image: Image.Image, scale: float, focal_x: float, focal_y: float) -> Image.Image:
    target_ratio = WIDTH / HEIGHT
    source_ratio = image.width / image.height
    if source_ratio > target_ratio:
        base_height = HEIGHT
        base_width = round(base_height * source_ratio)
    else:
        base_width = WIDTH
        base_height = round(base_width / source_ratio)
    base_width = round(base_width * scale)
    base_height = round(base_height * scale)
    resized = image.resize((base_width, base_height), Image.Resampling.LANCZOS)
    left = max(0, min(base_width - WIDTH, round(focal_x * base_width - WIDTH / 2)))
    top = max(0, min(base_height - HEIGHT, round(focal_y * base_height - HEIGHT / 2)))
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def caption(frame: Image.Image, scene: Scene, progress: float) -> Image.Image:
    canvas = frame.convert("RGBA")
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fade = min(1.0, progress * 5, (1 - progress) * 7)
    alpha = max(0, round(235 * fade))
    top = HEIGHT - 118
    draw.rectangle((0, top, WIDTH, HEIGHT), fill=(13, 21, 29, alpha))
    draw.rectangle((44, top + 26, 49, top + 91), fill=(*GREEN, alpha))
    draw.text((70, top + 20), scene.title, font=FONT_TITLE, fill=(255, 255, 255, alpha))
    draw.text((72, top + 76), scene.subtitle, font=FONT_SUBTITLE, fill=(191, 202, 211, alpha))
    draw.text((WIDTH - 116, top + 25), "ONEOPS", font=FONT_SMALL, fill=(118, 154, 235, alpha))
    return Image.alpha_composite(canvas, overlay).convert("RGB")


def title_frame(image: Image.Image, scene: Scene, progress: float, outro: bool = False) -> Image.Image:
    background = cover(image, 1.03, 0.58, 0.48).filter(ImageFilter.GaussianBlur(6))
    background = ImageEnhance.Brightness(background).enhance(0.25)
    canvas = background.convert("RGBA")
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fade = min(1.0, progress * 3, (1 - progress) * 4)
    alpha = max(0, round(255 * fade))
    center_y = 292 if not outro else 270
    brand_box = draw.textbbox((0, 0), scene.title, font=FONT_BRAND)
    brand_width = brand_box[2] - brand_box[0]
    draw.rectangle((WIDTH / 2 - brand_width / 2 - 22, center_y - 7, WIDTH / 2 - brand_width / 2 - 13, center_y + 70), fill=(*BLUE, alpha))
    draw.text(((WIDTH - brand_width) / 2, center_y), scene.title, font=FONT_BRAND, fill=(255, 255, 255, alpha))
    subtitle_box = draw.textbbox((0, 0), scene.subtitle, font=FONT_SUBTITLE)
    subtitle_width = subtitle_box[2] - subtitle_box[0]
    draw.text(((WIDTH - subtitle_width) / 2, center_y + 90), scene.subtitle, font=FONT_SUBTITLE, fill=(195, 205, 213, alpha))
    if not outro:
        draw.text((WIDTH / 2 - 98, center_y + 145), "HACKATHON DEMO · 01:13", font=FONT_SMALL, fill=(80, 210, 160, alpha))
    return Image.alpha_composite(canvas, overlay).convert("RGB")


def mobile_frame(image: Image.Image, scene: Scene, progress: float) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), INK)
    grid = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid)
    for x in range(0, WIDTH, 40):
        grid_draw.line((x, 0, x, HEIGHT), fill=(75, 96, 110, 28), width=1)
    for y in range(0, HEIGHT, 40):
        grid_draw.line((0, y, WIDTH, y), fill=(75, 96, 110, 28), width=1)
    canvas = Image.alpha_composite(canvas.convert("RGBA"), grid)
    draw = ImageDraw.Draw(canvas)
    draw.text((84, 152), scene.title, font=FONT_TITLE, fill="white")
    lines = ["Responsive operations for an", "on-call team, with safe action", "boundaries built in."]
    for index, line in enumerate(lines):
        draw.text((86, 222 + index * 31), line, font=FONT_SUBTITLE, fill=(167, 181, 190))
    draw.rectangle((86, 350, 91, 454), fill=GREEN)
    draw.text((111, 352), "390 × 844", font=FONT_SMALL, fill=(87, 216, 169))
    draw.text((111, 386), "Company-scoped", font=FONT_SMALL, fill=(220, 228, 233))
    draw.text((111, 420), "ScreenConnect-ready", font=FONT_SMALL, fill=(220, 228, 233))
    phone_height = 650
    phone_width = round(image.width * phone_height / image.height)
    zoom = 1 + 0.012 * math.sin(progress * math.pi)
    phone = image.resize((round(phone_width * zoom), round(phone_height * zoom)), Image.Resampling.LANCZOS)
    phone_x = 820 - phone.width // 2
    phone_y = (HEIGHT - phone.height) // 2
    draw.rounded_rectangle((phone_x - 11, phone_y - 11, phone_x + phone.width + 11, phone_y + phone.height + 11), radius=28, fill=(7, 12, 17), outline=(86, 101, 111), width=2)
    canvas.alpha_composite(phone.convert("RGBA"), (phone_x, phone_y))
    return canvas.convert("RGB")


def render_scene(scene: Scene, progress: float) -> Image.Image:
    source = Image.open(CAPTURES / scene.image).convert("RGB")
    if scene.mode == "title":
        return title_frame(source, scene, progress)
    if scene.mode == "outro":
        return title_frame(source, scene, progress, outro=True)
    if scene.mode == "mobile":
        return mobile_frame(source, scene, progress)
    eased = 0.5 - math.cos(progress * math.pi) / 2
    frame = cover(source, 1 + 0.025 * eased, scene.focal_x, scene.focal_y)
    return caption(frame, scene, progress)


def main() -> None:
    sys.path.insert(0, str(ROOT / ".video-tools"))
    import imageio_ffmpeg

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg, "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUTPUT),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    if process.stdin is None:
        raise RuntimeError("Unable to open FFmpeg input")

    previous: Image.Image | None = None
    transition_frames = round(0.45 * FPS)
    try:
        for scene_index, scene in enumerate(SCENES):
            total_frames = round(scene.duration * FPS)
            first = render_scene(scene, 0)
            for frame_index in range(total_frames):
                progress = frame_index / max(1, total_frames - 1)
                frame = render_scene(scene, progress)
                if previous is not None and frame_index < transition_frames:
                    alpha = frame_index / transition_frames
                    frame = Image.blend(previous, frame, alpha)
                process.stdin.write(frame.tobytes())
            previous = render_scene(scene, 1)
    finally:
        process.stdin.close()

    result = process.wait()
    if result != 0:
        raise SystemExit(result)
    print(OUTPUT)


if __name__ == "__main__":
    main()
