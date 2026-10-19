"""Bundle open-license font variants used by the authored template collection."""
from pathlib import Path
from urllib.request import Request, urlopen
import concurrent.futures
import json

ROOT=Path(__file__).resolve().parents[1]
FONT_DIR=ROOT/'public/fonts/display'
FAMILIES={
 'anton':[400], 'bebas-neue':[400], 'six-caps':[400], 'league-gothic':[400],
 'league-spartan':[400,700,800], 'italiana':[400], 'bodoni-moda':[400,700],
 'cormorant-garamond':[400,600], 'dm-serif-display':[400], 'montserrat':[400,700,800],
 'great-vibes':[400], 'allura':[400], 'caveat':[400], 'playfair-display':[400,700],
 'archivo-black':[400], 'space-grotesk':[400,700],
}
def get(url):
 return urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=35).read()
def family(entry):
 key,weights=entry
 records=[]
 for weight in weights:
  filename=f'{key}-{weight}.woff2';target=FONT_DIR/filename
  url=f'https://cdn.jsdelivr.net/fontsource/fonts/{key}@latest/latin-{weight}-normal.woff2'
  if not target.exists():target.write_bytes(get(url))
  records.append({'id':key,'weight':weight,'style':'normal','subset':'latin','url':f'/fonts/display/{filename}','source':url})
 if key=='cormorant-garamond':
  target=FONT_DIR/f'{key}-400-italic.woff2'
  url=f'https://cdn.jsdelivr.net/fontsource/fonts/{key}@latest/latin-400-italic.woff2'
  if not target.exists():target.write_bytes(get(url))
  records.append({'id':key,'weight':400,'style':'italic','subset':'latin','url':f'/fonts/display/{target.name}','source':url})
 license_file=FONT_DIR/f'{key}-LICENSE.txt'
 if not license_file.exists():license_file.write_bytes(get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{key.replace("-", "")}/OFL.txt'))
 return records

if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
  entries=[record for group in executor.map(family,FAMILIES.items()) for record in group]
 (FONT_DIR/'editorial-sources.json').write_text(json.dumps(entries,indent=2)+'\n',encoding='utf-8')
 print(f'Bundled {len(entries)} font variants with family license files.')
