"""Compile native editable documents and raster previews from the same authored layers.

Font measurements and text baselines follow Fabric's 1.13 / .222 text metrics.
Previews are generated assets; the editable document is always authoritative.
"""
from pathlib import Path
import io, json, math, re
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageColor
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'artifacts/reference-collection'
OUT=ROOT/'public/images/editorial-templates'
OUT.mkdir(parents=True,exist_ok=True)
FONT_DIR=ROOT/'public/fonts/display'
FONT_CACHE=WORK/'fonts'
FONT_CACHE.mkdir(exist_ok=True)
source=json.loads((WORK/'authored.json').read_text(encoding='utf-8'))

def slug(family):return family.lower().replace(' ','-')
@lru_cache(maxsize=128)
def font_file(family,weight,style='normal'):
 key=slug(family)
 if key=='manrope':path=ROOT/'public/fonts/manrope-latin-wght-normal.woff2'
 else:
  exact=FONT_DIR/f'{key}-{weight}{"-italic" if style=="italic" else ""}.woff2'
  if exact.exists():path=exact
  else:
   options=[p for p in FONT_DIR.glob(f'{key}-*.woff2') if re.search(r'-\d+\.woff2$',p.name)]
   if not options:raise ValueError(f'Missing font {family}')
   path=min(options,key=lambda p:abs(int(p.stem.rsplit('-',1)[1])-weight))
 target=FONT_CACHE/f'{key}-{weight}-{style}.ttf'
 if not target.exists():
  font=TTFont(path)
  if 'fvar' in font:
   axes={a.axisTag:(weight if a.axisTag=='wght' else a.defaultValue) for a in font['fvar'].axes}
   font=instantiateVariableFont(font,axes,inplace=True)
  font.flavor=None;font.save(target)
 return str(target)

@lru_cache(maxsize=512)
def get_font(family,weight,size,style='normal'):return ImageFont.truetype(font_file(family,weight,style),max(1,size))
def color(value,opacity=1):
 if not value or value=='transparent':return (0,0,0,0)
 rgba=ImageColor.getcolor(value,'RGBA');return rgba[:3]+(round(rgba[3]*opacity),)

def prepare(art):
 doc=art['document']
 for page in doc['pages']:
  for obj in page['objects']:
   if obj['type']=='textbox':
    size=obj['fontSize'];font=get_font(obj['fontFamily'],int(obj['fontWeight']),1000,obj.get('fontStyle','normal'))
    def length(line):return font.getlength(line)/1000*size+max(0,len(line)-1)*obj.get('charSpacing',0)*size/1000
    widest=max(length(line) for line in obj['text'].split('\n'))
    if widest>obj['width']*.98:obj['fontSize']*=obj['width']*.98/widest
    obj['height']=obj['fontSize']*1.13*(1+(len(obj['text'].split('\n'))-1)*obj['lineHeight'])
   if obj['type']=='image' and obj.pop('authoringPhoto',False):
    image=Image.open(ROOT/('public'+obj['src']))
    w,h=obj['width'],obj['height'];scale=max(w/image.width,h/image.height)
    if art['id']=='editorial-semi-casual':scale*=1.21
    cw,ch=w/scale,h/scale
    obj['cropX']=max(0,(image.width-cw)*obj.pop('focusX',.5))
    obj['cropY']=max(0,(image.height-ch)*obj.pop('focusY',.5))
    obj['width'],obj['height']=cw,ch;obj['scaleX']=obj['scaleY']=scale
  page['notes']='Reference-inspired editable composition. Photos and unverified fonts are free alternatives; exact source matches are not asserted. All sample names, addresses and business figures are editable placeholders.'
 art['collection']='reference'
 return art

def render(art,width=720):
 doc=art['document'];page=doc['pages'][0];s=width/doc['width'];height=round(doc['height']*s)
 canvas=Image.new('RGBA',(width,height),color(page['background']['color']))
 for obj in page['objects']:
  layer=Image.new('RGBA',(width,height));draw=ImageDraw.Draw(layer)
  x,y=obj.get('left',0)*s,obj.get('top',0)*s
  w,h=obj.get('width',0)*obj.get('scaleX',1)*s,obj.get('height',0)*obj.get('scaleY',1)*s
  kind=obj['type'];fill=color(obj.get('fill'));stroke=color(obj.get('stroke'));sw=max(1,round(obj.get('strokeWidth',0)*s))
  if kind=='image':
   image=Image.open(ROOT/('public'+obj['src'])).convert('RGBA');cx,cy=obj.get('cropX',0),obj.get('cropY',0)
   image=image.crop((cx,cy,cx+obj['width'],cy+obj['height'])).resize((max(1,round(w)),max(1,round(h))),Image.Resampling.LANCZOS)
   if obj.get('filterSpecs'):image=ImageOps.grayscale(image).convert('RGBA')
   if obj.get('maskShape')=='circle':
    mask=Image.new('L',image.size);ImageDraw.Draw(mask).ellipse((0,0,image.width,image.height),fill=255);image.putalpha(mask)
   layer.paste(image,(round(x),round(y)),image)
  elif kind=='textbox':
   fs=obj['fontSize']*s;family=obj['fontFamily'];font=get_font(family,int(obj['fontWeight']),round(fs*4),obj.get('fontStyle','normal'))
   # Supersampled glyphs retain fine hairlines at thumbnail size.
   tw=max(1,math.ceil(w*4+fs*4));th=max(1,math.ceil((h+fs*.5)*4));text_image=Image.new('RGBA',(tw,th));td=ImageDraw.Draw(text_image)
   for i,line in enumerate(obj['text'].split('\n')):
    tracking=obj.get('charSpacing',0)*fs/1000*4
    length=font.getlength(line)+max(0,len(line)-1)*tracking
    dx=0 if obj['textAlign']=='left' else ((w*4-length)/2 if obj['textAlign']=='center' else w*4-length)
    baseline=(fs*.87914+i*fs*1.13*obj['lineHeight'])*4
    if tracking:
     for char in line:td.text((dx,baseline),char,font=font,fill=fill,anchor='ls');dx+=font.getlength(char)+tracking
    else:td.text((dx,baseline),line,font=font,fill=fill,anchor='ls')
   text_image=text_image.resize((math.ceil(tw/4),math.ceil(th/4)),Image.Resampling.LANCZOS)
   if obj.get('angle'):
    angle=math.radians(obj['angle']);rotated=text_image.rotate(-obj['angle'],Image.Resampling.BICUBIC,expand=True)
    corners=[(0,0),(text_image.width,0),(0,text_image.height),(text_image.width,text_image.height)]
    dx=min(px*math.cos(angle)-py*math.sin(angle) for px,py in corners)
    dy=min(px*math.sin(angle)+py*math.cos(angle) for px,py in corners)
    layer.paste(rotated,(round(x+dx),round(y+dy)),rotated)
   else:layer.paste(text_image,(round(x),round(y)),text_image)
  elif kind=='rect':draw.rounded_rectangle((x,y,x+w,y+h),radius=obj.get('rx',0)*s,fill=fill,outline=stroke if obj.get('stroke') else None,width=sw)
  elif kind=='ellipse':draw.ellipse((x,y,x+w,y+h),fill=fill,outline=stroke if obj.get('stroke') else None,width=sw)
  elif kind=='line':draw.line((x+obj.get('x1',0)*s,y+obj.get('y1',0)*s,x+obj.get('x2',0)*s,y+obj.get('y2',0)*s),fill=stroke,width=sw)
  elif kind=='polygon':draw.polygon([(x+p['x']*s,y+p['y']*s) for p in obj['points']],fill=fill)
  if obj.get('angle') and kind!='textbox':layer=layer.rotate(-obj['angle'],Image.Resampling.BICUBIC,center=(x,y))
  if obj.get('opacity',1)<1:layer.putalpha(layer.getchannel('A').point(lambda a:int(a*obj['opacity'])))
  canvas=Image.alpha_composite(canvas,layer)
 return canvas.convert('RGB')

templates=[prepare(art) for art in source['templates']]
for i,art in enumerate(templates):
 image=render(art);image.save(OUT/f"{art['id']}.webp",quality=90,method=4)
 if i%10==0:print(f'Rendered {i+1}/{len(templates)}',flush=True)
data={'version':1,'templates':templates}
(ROOT/'src/services/mocks/editorial-template-data.json').write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf-8')
for category in dict.fromkeys(t['category'] for t in templates):
 group=[t for t in templates if t['category']==category];sheet=Image.new('RGB',(1500,540),'#edf0f3');draw=ImageDraw.Draw(sheet)
 for i,art in enumerate(group):
  image=Image.open(OUT/f"{art['id']}.webp");image.thumbnail((280,480));sheet.paste(image,(i*300+(300-image.width)//2,10));draw.text((i*300+10,505),art['title'][:35],fill='#222222')
 sheet.save(WORK/f'{category.lower().replace(" ","-")}-proof.jpg',quality=94)
print(f'Compiled {len(templates)} editable documents and matching previews.',flush=True)
