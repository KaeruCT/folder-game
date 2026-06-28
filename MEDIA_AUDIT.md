# Media audit

Scope: all image/video/audio assets used by the storylines. The Lockdown assets were treated as the reference vibe: diegetic, weird, artifacted, and specific rather than generic stock-like images.

## Findings

| Story | Asset(s) | Fit before | Action |
| --- | --- | --- | --- |
| The Lockdown | `images/*`, `public/vid/*` | Strong. Feels like strange recovered internet/media artifacts. | Left unchanged. |
| The Echoes Below | `metro_station.jpg`, `hollow_earth.jpg`, `inner_city.jpg`, `chamber.jpg`, `chiara_metaphor.jpg`, `the_void.jpg` | Too generic / stock-fantasy in places. Some files only vaguely matched their names. | Replaced with original diegetic expedition scans, CCTV stills, sonar returns, redacted subject evidence, and final void artifact. |
| The Echoes Below | `cave_atmosphere.mp3`, `cave_deep.mp3` | Both were long, large, and too similar. | Rebuilt as distinct quiet cave/low-depth loops. |
| The Things We Don't Say | all images | Too generic classroom/garden/graduation imagery. Did not feel like files from Daniel's laptop. | Replaced with original low-fi laptop artifacts: desk photo, security still, empty room, garden memory, graduation evidence, handwritten letter. |
| The Things We Don't Say | `classroom_ambient.mp3`, `rain_soft.mp3` | Too short to work as ambience (`classroom_ambient` was ~0.23s, `rain_soft` was ~2.2s). | Rebuilt as subtle 32s/35s loops. |
| The Agent in the Machine | borrowed Echoes media | Wrong story identity. | Added original `audit_room.jpg` and `ambient_hum.mp3`. |

## Direction going forward

Media should feel like it belongs inside the filesystem, not like an illustration of the filename.

Prefer:
- CCTV stills
- scans
- terminal captures
- corrupted photos
- documents with annotations
- diegetic evidence labels
- low-fidelity artifacts

Avoid:
- clean stock photos
- generic symbolic images
- images that only match the filename literally
- polished fantasy art that does not look like a recovered file
