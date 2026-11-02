"""Offline derivative generation. Requires Pillow; no network/AI. Input must already have reviewed rights."""
import argparse,json,pathlib,hashlib
from PIL import Image,ImageOps
p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('metadata');p.add_argument('output');a=p.parse_args()
m=json.loads(pathlib.Path(a.metadata).read_text());allowed={'CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0','CC-BY-3.0','CC-BY-SA-3.0'}
if m.get('license') not in allowed or m.get('review_status')!='approved-for-publication' or not all(m.get(k) for k in ['photographer','source','attribution','reviewer','reviewed_on']):raise ValueError('Reviewed license/source/owner/attribution required')
if not m.get('id','').replace('-','').replace('_','').isalnum():raise ValueError('Invalid image identifier')
out=pathlib.Path(a.output).resolve()
repo=pathlib.Path(__file__).resolve().parents[1]
if out.is_relative_to(repo) and out.relative_to(repo).parts[:1]!=('work',):raise ValueError('Unreviewed output inside the repository must remain under work/')
out.mkdir(parents=True,exist_ok=True)
with Image.open(a.input) as original:
 image=ImageOps.exif_transpose(original).convert('RGB');variants=[];seen=set()
 for width in [320,640,960]:
  copy=image.copy();copy.thumbnail((width,width*4))
  if copy.width in seen:continue
  seen.add(copy.width);name=f"{m['id']}-{width}.webp";target=out/name
  # New RGB image has no EXIF/GPS or source metadata. Attribution remains in JSON.
  clean=Image.new('RGB',copy.size);clean.paste(copy);clean.save(target,'WEBP',quality=78,method=6)
  variants.append({'src':'./assets/buildings/'+name,'width':copy.width,'height':copy.height,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 main=min(variants,key=lambda v:abs(v['width']-640));m.update(src=main['src'],width=main['width'],height=main['height'],variants=variants)
 (out/(m['id']+'-metadata.json')).write_text(json.dumps(m,indent=2)+'\n');print(json.dumps({'variants':variants,'source_bytes':pathlib.Path(a.input).stat().st_size}))
