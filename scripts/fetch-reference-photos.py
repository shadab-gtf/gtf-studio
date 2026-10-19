"""Download the explicitly selected Pexels assets and keep a reproducible source manifest."""
import concurrent.futures
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/media/templates/editorial'
OUT.mkdir(parents=True, exist_ok=True)
PHOTOS = {
    'fashion-red': 994517, 'fashion-cream': 5886041, 'fashion-yellow': 1536619,
    'fashion-street': 1036623, 'fashion-coat': 7691223, 'portrait-woman': 3764011,
    'portrait-man': 2379005, 'menswear': 1043474, 'sunglasses': 1926769,
    'house': 106399, 'villa': 1396122, 'architecture': 323780,
    'living-room': 1571460, 'interior': 1643383, 'bedroom': 271624,
    'chair': 276724, 'perfume': 965989, 'concert': 1190297,
    'forest': 167698, 'mountains': 1366919, 'road': 443446,
    'restaurant': 262978, 'cocktail': 1283219, 'food': 958545,
    'flowers': 931177, 'fire': 266487, 'city': 466685,
    'coffee': 302899, 'camera': 90946, 'elephant': 247431,
}

def download(entry):
    name, photo_id = entry
    target = OUT / f'{name}.webp'
    source = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=1800'
    if not target.exists():
        request = Request(source, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(request, timeout=40) as response:
            image = Image.open(io.BytesIO(response.read())).convert('RGB')
        image.thumbnail((2000, 2400))
        image.save(target, 'WEBP', quality=88, method=6)
    with Image.open(target) as image:
        size = image.size
    return {'id': name, 'file': f'/media/templates/editorial/{name}.webp', 'width': size[0], 'height': size[1], 'source': source, 'page': f'https://www.pexels.com/photo/{photo_id}/', 'license': 'https://www.pexels.com/license/', 'match': 'Selected free alternative; not asserted to be the original screenshot photograph.'}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        entries = list(executor.map(download, PHOTOS.items()))
    (OUT / 'sources.json').write_text(json.dumps(entries, indent=2) + '\n', encoding='utf-8')
    sheet = Image.new('RGB', (1200, 240 * ((len(entries) + 5) // 6)), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, entry in enumerate(entries):
        image = Image.open(ROOT / ('public' + entry['file'])).convert('RGB')
        image.thumbnail((194, 205))
        x, y = (i % 6) * 200, (i // 6) * 240
        sheet.paste(image, (x + (200-image.width)//2, y))
        draw.text((x+5, y+210), entry['id'], fill='black')
    proof = ROOT / 'artifacts/reference-collection'
    proof.mkdir(parents=True, exist_ok=True)
    sheet.save(proof / 'photo-contact-sheet.jpg')
    print(f'Downloaded and recorded {len(entries)} photos.')

