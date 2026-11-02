"""Offline nonsemantic pixel features; never estimates floors, GPS, facade identity or height."""
import argparse,json,pathlib,hashlib
from PIL import Image,ImageOps
p=argparse.ArgumentParser();p.add_argument('image');p.add_argument('metadata');p.add_argument('output');a=p.parse_args()
m=json.loads(pathlib.Path(a.metadata).read_text());allowed={'CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0','CC-BY-3.0','CC-BY-SA-3.0'}
if m.get('license') not in allowed or m.get('review_status')!='approved-for-publication' or not all(m.get(k) for k in ['id','photographer','source','attribution','reviewer','reviewed_on']):raise ValueError('Reviewed reusable photo rights required')
out=pathlib.Path(a.output).resolve()
if any(part in {'.site','data','assets','docs'} for part in out.parts):raise ValueError('Unreviewed visual features must remain outside public assets')
with Image.open(a.image) as original:
 image=ImageOps.exif_transpose(original).convert('RGB');width,height=image.size;image.thumbnail((128,128));quantized=image.quantize(colors=5);palette=quantized.getpalette();counts=sorted(quantized.getcolors(),reverse=True)
 colors=[{'rgb':palette[i*3:i*3+3],'pixel_fraction':count/(image.width*image.height)} for count,i in counts]
result={'schema_version':'0.5.0','photo_id':m['id'],'image_sha256':hashlib.sha256(pathlib.Path(a.image).read_bytes()).hexdigest(),'extractor':'Pillow 12.3.0 / EXIF orientation + 128px five-color quantization','width':width,'height':height,'dominant_image_colors':colors,'review_status':'unreviewed-pixel-features','limitations':'Image colors include sky, vegetation and surroundings; they are not facade labels or building identity. No OCR, semantic AI, floor/GPS/height inference or acceptance performed.'}
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,indent=2)+'\n');print('Private pixel features written; no semantic or geographical claim.')
