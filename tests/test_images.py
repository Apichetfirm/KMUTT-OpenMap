import unittest,tempfile,pathlib,json,subprocess,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
class ImageTools(unittest.TestCase):
 def test_optimized_derivatives_and_private_pixel_features(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);image=Image.new('RGB',(1200,900),'#8db5bd');exif=Image.Exif();exif[271]='Synthetic fixture metadata';source=root/'source.jpg';image.save(source,exif=exif)
   metadata={'id':'synthetic','license':'CC0-1.0','review_status':'approved-for-publication','photographer':'Synthetic fixture','source':'https://example.org/test','attribution':'Synthetic QA only','reviewer':'QA','reviewed_on':'2026-11-02'};meta=root/'metadata.json';meta.write_text(json.dumps(metadata))
   subprocess.run([sys.executable,str(ROOT/'scripts/optimize-building-images.py'),str(source),str(meta),str(root/'derivatives')],check=True,capture_output=True)
   self.assertEqual(len(list((root/'derivatives').glob('*.webp'))),3)
   for file in (root/'derivatives').glob('*.webp'):
    with Image.open(file) as result:self.assertFalse(result.getexif());self.assertLess(file.stat().st_size,120000)
   output=root/'features.json';subprocess.run([sys.executable,str(ROOT/'scripts/extract-photo-features.py'),str(source),str(meta),str(output)],check=True,capture_output=True)
   features=json.loads(output.read_text());self.assertEqual(features['width'],1200);self.assertEqual(len(features['image_sha256']),64);self.assertAlmostEqual(sum(x['pixel_fraction'] for x in features['dominant_image_colors']),1)
 def test_unreviewed_rights_are_rejected(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);meta=root/'metadata.json';meta.write_text('{}')
   for script in ['optimize-building-images.py','extract-photo-features.py']:
    result=subprocess.run([sys.executable,str(ROOT/'scripts'/script),str(root/'missing.jpg'),str(meta),str(root/'output')],capture_output=True,text=True)
    self.assertNotEqual(result.returncode,0);self.assertIn('rights' if 'extract' in script else 'license',result.stderr.lower())
if __name__=='__main__':unittest.main()
