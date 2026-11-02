"""Acquire a minimal, privacy-preserving ODbL campus snapshot; never accept associations.
Usage: python scripts/acquire-osm.py [saved-osm-api-response.xml]
"""
import sys,json,urllib.request,xml.etree.ElementTree as ET,datetime,pathlib
url='https://www.openstreetmap.org/api/0.6/map?bbox=100.488,13.646,100.499,13.658'
raw=pathlib.Path(sys.argv[1]).read_bytes() if len(sys.argv)>1 else urllib.request.urlopen(url,timeout=45).read()
root=ET.fromstring(raw)
matching={'N3':(436983064,'ภาควิชาเคมี'),'N4':(436983063,'ภาควิชาคณิตศาสตร์'),'N9':(346450376,'Institute for Field Robotics'),'N10':(311879209,'สำนักหอสมุด'),'N11':(224982053,'คณะเทคโนโลยีสารสนเทศ'),'N16':(1333533935,'LX'),'N17':(420534143,'อาคารเรียนรวม 2'),'N20':(436983061,'อาคารเรียนรวม 1'),'S4':(420044928,'กลุ่มอาคารวิศวะวัฒนะ'),'S5':(420045662,'หอพักธรรมรักษา 2'),'S6':(420051710,'หอพักธรรมรักษา 1'),'S7':(436983066,'ศูนย์พัฒนาเด็กเล็ก มจธ.'),'S9':(651713745,'คณะพลังงานสิ่งแวดล้อมและวัสดุ'),'S10':(1333533934,'Green Society'),'S11':(420533543,'CB5'),'S12':(420534334,'CB4'),'S13':(420534582,'CB3'),'S15':(436983067,'ภาควิชาวิศวกรรมเคมี')}
keep_tags={'name','name:th','name:en','alt_name','building','building:levels','roof:shape','amenity','shop','highway','public_transport','bus','foot','access','surface','opening_hours'}
nodes={};ways=[]
for el in root:
 if el.tag not in ['node','way']:continue
 t={e.attrib['k']:e.attrib['v'] for e in el.findall('tag') if e.attrib['k'] in keep_tags}
 a=el.attrib
 item={'type':el.tag,'id':int(a['id']),'version':int(a['version']),'timestamp':a['timestamp'],'tags':t}
 if el.tag=='node':item.update(lon=float(a['lon']),lat=float(a['lat']));nodes[item['id']]=item
 else:item['nodes']=[int(x.attrib['ref']) for x in el.findall('nd')];ways.append(item)
poi_amenities={'restaurant','food_court','fast_food','cafe','library','atm','bank','clinic','pharmacy','dentist','parking','toilets','drinking_water'}
def is_poi(t):return (t.get('name') or t.get('name:en') or t.get('amenity') in {'parking','toilets','drinking_water'} or t.get('highway')=='bus_stop') and (t.get('amenity') in poi_amenities or t.get('shop') in {'convenience','copyshop'} or t.get('highway')=='bus_stop') and t.get('access') not in {'private','no'}
way_ids={i for i,n in matching.values()};selected_ways=[]
for w in ways:
 ps=[nodes[i] for i in w['nodes'] if i in nodes]
 inside=bool(ps) and all(100.488<float(p['lon'])<100.499 and 13.646<float(p['lat'])<13.658 for p in ps)
 if w['id'] in way_ids or inside and (is_poi(w['tags']) or w['tags'].get('highway') in {'footway','pedestrian','steps'}):selected_ways.append(w)
needed={i for w in selected_ways for i in w['nodes']}
selected_nodes=[n for i,n in nodes.items() if i in needed or is_poi(n['tags']) and 100.488<n['lon']<100.499 and 13.646<n['lat']<13.658 or i in {3176409863,3176409879}]
# Strip incidental tags on nodes retained only as geometry vertices.
for n in selected_nodes:
 if not is_poi(n['tags']) and n['id'] not in {3176409863,3176409879}:n['tags']={}
output={'source':url,'retrieved_on':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).date().isoformat(),'license':'ODbL-1.0','attribution':'© OpenStreetMap contributors','matching':{c:{'way_id':i,'expected_name':n} for c,(i,n) in matching.items()},'elements':selected_nodes+selected_ways}
path=pathlib.Path(__file__).resolve().parent.parent/'data/evidence/osm-campus-snapshot.json';path.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n');print(f'Saved {len(selected_nodes)} nodes/{len(selected_ways)} ways; no contributor identities or private access data.')
