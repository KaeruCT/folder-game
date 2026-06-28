# Media audit

Scope: all image/video assets used by the storylines. The Lockdown assets were treated as the reference vibe: diegetic, weird, artifacted, and specific. Lockdown was left unchanged.

## Direction

The weak point was not the file names — it was that several non-Lockdown images looked like generic/generated illustrations. The replacement pass uses real photographic/public-domain or Commons source material, then applies light in-world treatment: lowered saturation, noise, CCTV/archive labels, redaction, and scanner-style degradation.

Media should feel like it belongs inside the filesystem, not like an illustration of the filename.

Prefer:
- CCTV stills
- scans
- terminal captures
- corrupted photos
- documents with annotations
- real locations treated as evidence
- low-fidelity artifacts

Avoid:
- clean stock photos
- generic symbolic images
- obviously generated art
- images that only match the filename literally
- polished fantasy art that does not look like a recovered file

## Changes

| Story | Asset(s) | Action |
| --- | --- | --- |
| The Lockdown | `images/*`, `public/vid/*` | Left unchanged. These already match the intended weird recovered-media vibe. |
| The Echoes Below | `metro_station.jpg`, `hollow_earth.jpg`, `inner_city.jpg`, `chamber.jpg`, `chiara_metaphor.jpg`, `the_void.jpg` | Replaced generated/stock-like images with real Commons/NASA/Unsplash-source photographs, then filtered as CCTV, expedition, subject-file, and final-frame artifacts. |
| The Things We Don't Say | all images | Replaced generated evidence images with real classroom, hallway, graduation, garden, and handwritten-letter source material, treated as laptop/photo archive files. |
| The Agent in the Machine | `audit_room.jpg` | Replaced generated audit-room art with a real server-room photograph, treated as a process-capture artifact. |
| Audio files | all storylines | Removed. They did not add enough to the game loop. |

## Source assets / attribution notes

All replacement source images came from Wikimedia Commons file pages or Commons-hosted Unsplash/NASA/National Archives material. Keep this list if publishing the game publicly.

- `Waiting for my train (Unsplash).jpg` — source for Echoes metro/CCTV image.
- `Mammoth Cave Rotunda (USGS Lwt02830).jpg` — source for Echoes Hollow Earth cave image.
- `Derinkuyu Underground City 9910 Nevit Enhancer.jpg` — source for Echoes inner-city image.
- `Postojna cave 2008-02-01 interior 07.jpg` — source for Echoes chamber image.
- `Green Cardigan, Red Hair, and a Galaxy Print Dress (17023029306).jpg` — source for Chiara subject-file image.
- `Black hole (NASA).jpg` — source for Echoes final void image.
- `School, man, teacher, blackboard, desk Fortepan 2278.jpg` — source for Daniel classroom/archive image.
- `Ann Savage cultivates her own Victory Garden, 1944.jpg` — source for Elena garden image.
- `Empty classroom.jpg` — source for empty classroom image.
- `A new graduate and her mother at the Salish Kootenai College graduation. (14377680765).jpg` — source for Maya graduation image.
- `Letter from Leonardo da Vinci to Ludovico Sforza.jpg` — source for handwritten letter scan.
- `School hallway.jpg` — source for Westbrook hallway image.
- `A view of the server room at The National Archives.jpg` — source for Agent audit-room image.
