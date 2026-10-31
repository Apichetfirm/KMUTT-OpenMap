# Field-survey protocol

Do not enter restricted areas or record personal/private information. Obtain university approval before collecting internal plans, CAD files or security-related datasets.

For each building:
1. Record the official code from signage plus Thai/English names, evidence URL/date.
2. Take GPS coordinates at the **main public entrance**, not the approximate building centroid.
3. Match polygon to official campus map and building photographs; save source and confidence.
4. Record floor count independently of physical height; set `building_height_m:null` without measurements.
5. Review potential conflicts with the official BGM navigation map.
6. Have another volunteer review the proposed change before merging it.

For walking paths:
- Survey connected public pedestrian segments, ramps and steps separately.
- Capture gate opening schedules, width/accessibility, obstacles and crossings.
- Reject graph edges crossing building footprints unless a real traversable public passage exists.
- Test every proposed edge on foot and require two reviewers for inaccessible/critical routes.
- Never claim accurate emergency evacuation routing.

For contributions, open a GitHub Issue with a source or date. Omit faces, employee details, student IDs and non-public site plans.
