import { createDirectoryStructure, type Directory } from "../files";
import type { Inventory } from "../inventory";
import type { Storyline } from "../storyline";

const storyline: Storyline = {
    id: "echoes",
    name: "The Echoes Below",
    description:
        "Frank Nicholas vanished into the Hollow Earth. His server holds the answers. Uncover his obsession, his discoveries, and the terrible choice that awaits.",

    buildFilesystem(): Directory {
        const rootDir = createDirectoryStructure("$ROOT");
        const root = rootDir.root;

        // =========================================================================
        // SERVER INFO
        // =========================================================================

        root.createFile("server_info.txt", SERVER_INFO);

        // =========================================================================
        // DIARY — locked behind diary_key
        // =========================================================================

        const diary = root.createDirectory("diary", { key: "diary_key" });
        diary.createFile("entry_01_first_sighting.txt", DIARY_01);
        diary.createFile("entry_02_she_wont_leave_my_mind.txt", DIARY_02);
        diary.createFile("entry_03_the_expedition.txt", DIARY_03, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { expedition_clearance: 1 } });
                ctx.log("story", "Frank joined an expedition to the Hollow Earth. His colleague Danny went with him.");
                ctx.log(
                    "milestone",
                    "Acquired expedition clearance code — Frank embedded it in this entry. The restricted expedition reports can now be unlocked.",
                );
            },
        });
        diary.createFile("entry_04_they_dont_speak.txt", DIARY_04);
        diary.createFile("entry_05_the_path_of_echoes.txt", DIARY_05, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Frank discovered the Path of Echoes — an ancient religion from the inner world that has resurfaced.",
                );
            },
        });
        diary.createFile("entry_06_the_passage.txt", DIARY_06, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Frank found a passage in the sacred texts — something about a 'divided one' whose blood grants telepathy.",
                );
            },
        });
        diary.createFile("entry_07_she_is_the_one.txt", DIARY_07, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/chiara" });
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/diary/entry_08_the_plan.txt" });
                ctx.log(
                    "story",
                    "Frank believes Chiara Maria is a child of the inner world — and the key to his ritual.",
                );
                ctx.log(
                    "milestone",
                    "A hidden folder about Chiara has been revealed. Frank's plan begins to take shape.",
                );
            },
        });
        diary.createFile("entry_08_the_plan.txt", DIARY_08, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/diary/entry_09_goodbye.txt" });
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/messages/danny_3.txt" });
                ctx.log("story", "Frank made contact with someone named Kael — a person from the inner world.");
                ctx.log("goal", "Find out who Kael is and what they told Frank.");
            },
        });
        diary.createFile("entry_09_goodbye.txt", DIARY_09, {
            hidden: true,
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Frank's final diary entry. He left to find Chiara — and he doesn't expect to return.",
                );
            },
        });

        // =========================================================================
        // RESEARCH
        // =========================================================================

        const research = root.createDirectory("research");
        research.createFile("hollow_earth.txt", RESEARCH_HOLLOW_EARTH, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { diary_key: 1 } });
                ctx.log("story", "Learned about the discovery of the Hollow Earth and its telepathic inhabitants.");
                ctx.log("milestone", "Found a reference to Frank's private diary. The diary is now accessible.");
                ctx.log("goal", "Open Frank's diary to understand his personal connection to the Hollow Earth.");
            },
        });
        research.createFile("echo_religion.txt", RESEARCH_ECHO_RELIGION, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "The Path of Echoes is an ancient inner-world religion spreading on the surface. Frank was deeply studying it.",
                );
            },
        });

        // Expedition reports — report_1 is public; reports 2&3 require clearance
        const expeditions = research.createDirectory("expeditions");
        expeditions.createFile("report_1.txt", EXPEDITION_1);
        const restricted = expeditions.createDirectory("restricted", { key: "expedition_clearance" });
        restricted.createFile("report_2.txt", EXPEDITION_2, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { echo_cipher: 1 } });
                ctx.log(
                    "story",
                    "Frank's second expedition report mentions contact with the inner people and their religious practices.",
                );
                ctx.log(
                    "milestone",
                    "Found an Echo Cipher — Frank used it to decrypt the inner people's sacred texts. The sacred texts directory is now accessible.",
                );
                ctx.log("goal", "Open the sacred texts directory to read the decrypted fragments.");
            },
        });
        restricted.createFile("report_3.txt", EXPEDITION_3, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { kael_contact: 1 } });
                ctx.log(
                    "story",
                    "Frank's third expedition — he met Kael, an inner-world figure connected to the Path of Echoes.",
                );
                ctx.log(
                    "milestone",
                    "Obtained Kael's contact credentials. The Kael messages directory is now accessible.",
                );
                ctx.log("goal", "Unlock Kael's messages to understand their arrangement.");
            },
        });

        // Sacred texts — echo_fragment is accessible; deeper texts locked behind echo_cipher
        const texts = research.createDirectory("texts");
        texts.createFile("echo_fragment.txt", TEXT_FRAGMENT, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "An excerpt from the Path of Echoes sacred text. It mentions a ritual of 'silent communion.' The rest of the texts appear to be encrypted — you'll need a cipher key to decode them.",
                );
                ctx.log("goal", "Find the Echo Cipher to unlock the rest of the sacred texts.");
            },
        });
        const sacred = texts.createDirectory("decrypted", { key: "echo_cipher" });
        sacred.createFile("echo_ritual.txt", TEXT_RITUAL, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/research/texts/decrypted/frank_translation.txt" });
                ctx.log(
                    "story",
                    "The full ritual text: 'Offer the blood of the divided one to the depths, and the silent tongue shall be yours.' Frank's translation notes are in the same directory.",
                );
                ctx.log("goal", "Read Frank's translation to understand what he plans to do.");
            },
        });
        sacred.createFile("frank_translation.txt", FRANK_TRANSLATION, {
            hidden: true,
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Frank's translation and interpretation of the ritual. He believes killing Chiara will grant him telepathy — and that the ritual gives him a 'good reason' to do it.",
                );
            },
        });

        // =========================================================================
        // MESSAGES
        // =========================================================================

        const messages = root.createDirectory("messages");

        // Danny (mutual friend)
        messages.createFile("danny_1.txt", DANNY_1, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Danny Vega — Frank's expedition colleague and a close friend of yours. He's been to the inner world.",
                );
            },
        });
        messages.createFile("danny_2.txt", DANNY_2, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Danny hates what the Hollow Earth represents. He thinks the new religions are dangerous cults.",
                );
            },
        });
        messages.createFile("danny_3.txt", DANNY_3, {
            hidden: true,
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Danny is worried about Frank. He hasn't heard from him. He knows something is wrong.",
                );
            },
        });

        // Kael — hollow-earth contact, locked behind kael_contact key
        const kaelDir = messages.createDirectory("kael", { key: "kael_contact" });
        kaelDir.createFile("kael_01_first_contact.txt", KAEL_1, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Kael first contacted Frank after noticing his interest in the Echo texts. They've been watching him.",
                );
            },
        });
        kaelDir.createFile("kael_02_she_is_the_one.txt", KAEL_2, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/messages/kael/kael_03_final_warning.txt" });
                ctx.log(
                    "story",
                    "Kael confirmed Chiara is an 'unawakened one' — a child of the inner world living on the surface. The Path of Echoes tracks them.",
                );
                ctx.log("goal", "Kael's next message was hidden. Find it in the kael directory.");
            },
        });
        kaelDir.createFile("kael_03_final_warning.txt", KAEL_3, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/resolve.txt" });
                ctx.log(
                    "story",
                    "Kael's final message: the inner world's resources are finite. The religion is a tool to bring surface people below.",
                );
                ctx.log("milestone", "All the pieces are in place. Frank's plan is clear. You must decide what to do.");
                ctx.log("goal", "Open resolve.txt to make your choice.");
            },
        });

        // =========================================================================
        // CHIARA (hidden — revealed by diary entry 07)
        // =========================================================================

        const chiara = root.createDirectory("chiara", { hidden: true });
        chiara.createFile("stalking_notes.txt", CHIARA_STALKING, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Frank stalked Chiara for months. He knows her schedule, her habits, her coffee order. This is obsessive.",
                );
            },
        });
        chiara.createFile("heritage_evidence.txt", CHIARA_HERITAGE, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Evidence that Chiara is a child of the inner world: sealed adoption records, unexplained dreams, unconscious telepathic intuition.",
                );
                ctx.log("goal", "You now know the truth about Chiara. But what will you do with it?");
            },
        });

        // =========================================================================
        // RESOLVE (hidden — revealed by Kael's final message)
        // =========================================================================

        root.createFile("resolve.txt", RESOLVE, {
            hidden: true,
            choices: [
                {
                    label: "Warn Chiara. Tell her everything — her heritage, Frank's plan, the truth.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_chiara.txt" },
                },
                {
                    label: "Stay silent. Frank has his reasons. Maybe this is how it has to be.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_silence.txt" },
                },
            ],
            onRead(ctx) {
                ctx.log("milestone", "You've uncovered Frank Nicholas's plan. Now you must choose.");
            },
        });

        // Ending files — revealed by resolve.txt choices
        root.createFile("ending_chiara.txt", ENDING_SAVE, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to warn Chiara.");
                ctx.log(
                    "story",
                    "ENDING: You told Chiara everything. She didn't believe you at first — but the evidence was undeniable. Together, you've begun helping her awaken her dormant abilities. The Path of Echoes won't stop, but neither will you. Frank's fate remains unknown... but Chiara is alive, and that's what matters.",
                );
            },
        });
        root.createFile("ending_silence.txt", ENDING_SILENCE, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 1 });
                ctx.log("milestone", "You chose to stay silent.");
                ctx.log(
                    "story",
                    "ENDING: Frank's plan may succeed. Chiara will never know what she is, or why she was targeted. The Path of Echoes will continue drawing surface people into the depths. You'll carry this secret — and the weight of your silence — alone.",
                );
            },
        });

        return root;
    },

    getInitialInventory(): Inventory {
        return {};
    },

    getInitialLogEntries() {
        const now = Date.now();
        return [
            {
                id: `log-${now}-0`,
                timestamp: now,
                category: "story" as const,
                text: "You've breached Frank Nicholas's remote server. Danny Vega mentioned it — he's worried about Frank.",
            },
            {
                id: `log-${now}-1`,
                timestamp: now,
                category: "goal" as const,
                text: "Start in the research folder. Frank was studying the Hollow Earth — his notes may contain access codes for the rest of the server.",
            },
        ];
    },
};

export default storyline;

// =============================================================================
// CONTENT — SERVER
// =============================================================================

const SERVER_INFO = `===============================
FRANK NICHOLAS — PERSONAL SERVER
===============================
Last login: [ERROR — DATE CORRUPTED]
Uptime: 387 days
===============================

This server contains research materials, personal
correspondence, and expedition documentation.

Users: frank_nicholas (admin)
       danny_vega (read-only, last access: 42 days ago)

If you are not Frank Nicholas, you should not be here.
`;

// =============================================================================
// CONTENT — DIARY ENTRIES
// =============================================================================

const DIARY_01 = `May 3rd

I saw her today. At the metro station on 14th. She was wearing a
green coat and reading something on her phone — biting her lip the
whole time like she was nervous about whatever it was.

I couldn't look away.

There's something about her eyes. They're too old for her face. Too...
knowing. I don't know how else to describe it.

I need to find out who she is.
`;

const DIARY_02 = `May 17th

Chiara Maria. She works at the same press building as someone I used
to know. I've been going to the café across the street every morning.

She gets coffee at 8:15. Oat milk latte, no sugar. Same thing every day.
She tips exactly one euro, always in coins.

I know this is wrong. I know how this sounds. But I can't help it.

She's the only thing that makes sense in my head anymore. Everything
else is noise. She's... quiet. Even when she's not there, I feel like
she's quiet in a way that matters.

Danny says I need to get out more. He's probably right.
`;

const DIARY_03 = `June 2nd

Danny convinced me. We're joining the next expedition to the Hollow
Earth. Three weeks underground. He says the inner cities have grown
since the discovery — they've built things down there, things we don't
have words for.

Maybe getting away from the surface will clear my head. Maybe I'll
stop thinking about her every waking second.

Danny's been three times already. He hates it down there — says the
inner people look at you like you're an animal in a zoo. But he keeps
going back. I think he's looking for something too.

We leave in four days.
`;

const DIARY_04 = `June 14th — Inner World, Day 4

They don't speak. Not a single word. Their mouths don't move.

The first time I saw two of them communicating, I thought they were
just staring at each other. But then one nodded and walked away, and
the other turned to me and wrote on a tablet: "My brother says you
are lost. You are not lost. You are exactly where you chose to be."

I asked how his brother told him that. He looked at me like I'd asked
how water is wet. "We do not speak with sounds. Sounds are... imprecise."

I've never felt more alone in my life. Being surrounded by people who
can share thoughts directly, while I'm trapped inside my own skull —
it's a kind of isolation I didn't know existed.

And yet. I keep thinking about Chiara. About how she might feel at
home here.
`;

const DIARY_05 = `July 8th — Surface

Back for two weeks. Danny and I are already planning the next trip.

I've been reading everything I can find about the religions that
sprang up around the Hollow Earth. Most are just surface-level cults —
people who think the inner world is heaven or that the inner people
are gods.

But one of them is different. The Path of Echoes.

It's older than the discovery. Carbon dating on their texts puts some
fragments at four thousand years. Four thousand. That means the Path
of Echoes originated underground and reached the surface millennia ago.
It's been dormant, waiting for the discovery to happen.

Now it's spreading fast. They have temples in twelve countries. They
recruit relentlessly. Their message: "Return to the source. The inner
world is your true home."

But surface people were never FROM the inner world. So why are they
being told to return?

I'm going to find out.
`;

const DIARY_06 = `August 23rd

I found it. A passage in one of the Echo texts. I've been translating
for weeks — the original is in a script I've never seen, a mix of
ideograms and what looks like mathematical notation.

The translation is rough but the meaning is clear enough:

"The seeker who offers the blood of the divided one to the depths
shall be granted the silent tongue. The gift carried but never
awakened — take it, and become whole."

"Divided one." "Gift carried but never awakened."

There are people on the surface who have the telepathic ability but
don't know it. They're... dormant. Children of the inner world, raised
on the surface, cut off from the collective mind.

And the text says if you offer their blood — if you kill one of them
in the right way — you can take the ability for yourself.

God. What am I writing.
`;

const DIARY_07 = `October 11th

She's one of them.

I've been tracking her for months. Her adoption records are sealed —
and the sealing was done by a law firm that doesn't exist anymore.
Her birth certificate lists a hospital that burned down six months
before she was born. None of it adds up unless you know what to
look for.

She told a coworker once that she sometimes knows what people are
going to say before they say it. She laughed it off as "good
intuition." She has dreams about places she's never seen — she
described a city built into a cavern wall, lit by something that
"looked like a small sun."

She's never been to the Hollow Earth. But she's described it perfectly.

Chiara Maria is a child of the inner world. A divided one.

And the ritual... the ritual says she's my way in.
`;

const DIARY_08 = `November 2nd

I've made contact with someone who can help. They call themselves
Kael. They're from the inner world — not just from there, but deeply
embedded in the Path of Echoes. They've been watching Chiara too.
They call her "the unawakened."

I don't know if Kael is helping me or manipulating me. I don't care
anymore.

Kael confirmed everything. The ritual is real. The inner world's
resources are finite — the Path of Echoes recruits surface people to
bring them below, to work, to serve. It's not a religion. It's a
resource operation dressed in scripture.

If I kill Chiara, I gain telepathy. If I gain telepathy, I can go to
the inner world and work from within. I can expose the Path of Echoes
for what it really is. I can stop the exploitation.

One life to save thousands.

But that's not the whole truth, is it. I'm lying to myself if I say
it's only about that. I want her. I've always wanted her. And this
way — the ritual — she doesn't just die. She becomes part of me.
Her gift lives on in me. We become... one.

That's not murder. That's... completion.
`;

const DIARY_09 = `November 15th

I'm leaving tonight. Danny doesn't know where I'm going. Nobody does.

Kael says the ritual must be performed in the inner world, at a
specific site — the Chamber of Echoes. I need to bring her there.
She doesn't know me, doesn't know any of this. I'll have to find a
way to convince her. Or force her. I haven't decided which.

If you're reading this — if someone found this server — I don't know
if I'll ever come back. Maybe that's fine. Maybe I'll stay down there
forever, among the silent ones, finally understood.

Chiara... if you somehow see this, I'm sorry. I love you more than
I've ever loved anything. That's why I have to do this.

/END
`;

// =============================================================================
// CONTENT — RESEARCH
// =============================================================================

const RESEARCH_HOLLOW_EARTH = `THE HOLLOW EARTH — AN OVERVIEW
====================================

Five years ago, a deep-seismic imaging project in the Pacific detected
massive subterranean cavities at depths previously thought to be solid
mantle. Initial findings were dismissed as sensor errors. They were not.

In 2021, Expedition Prometheus drilled through the crust approximately
400km east of the Mariana Trench and broke into a vast open space — an
ecosystem with its own atmosphere, water systems, and a self-sustaining
energy source at the core (colloquially called "the Inner Sun").

The inner world contains human inhabitants. They are genetically
identical to surface humans in every measurable way except one:
they possess a form of telepathic communication.

Key facts:

- Inner humans ("Inner People") communicate entirely through thought
  among themselves. They can write and read surface languages but do
  not speak. Their vocal cords appear functional but unused.

- Telepathy does NOT work between inner people and surface people.
  The mechanism is unknown. Leading theories suggest it requires
  exposure to the inner world's unique electromagnetic environment
  during early childhood development.

- Inner society is organized differently from surface society. They
  appear to have no formal governments, no currency, and no concept
  of individual property. Their social structures are poorly understood.

- Since the discovery, several new religious movements have formed
  around the Hollow Earth. Some worship the inner people. Others
  claim the inner world is humanity's true origin.
`;

const RESEARCH_ECHO_RELIGION = `THE PATH OF ECHOES — ANALYSIS
================================

Of all the religions that emerged after the Hollow Earth's discovery,
only one predates it: the Path of Echoes.

Carbon-dated fragments place the religion's origin at approximately
2000 BCE. The texts are written in a script unrelated to any known
surface language, with strong similarities to the symbolic notation
used by inner people today.

The Path of Echoes teaches that surface humanity is "divided" — split
from a unified whole that exists in the inner world. Their core
doctrine claims that all humans originally came from the Hollow Earth
and that returning there is the only path to spiritual completion.

Recruitment has accelerated dramatically since the discovery. Temples
now exist in over twelve countries. Converts are encouraged to make
pilgrimages to "the source" — expeditions into the Hollow Earth.

Alarming pattern: of the ~4,200 people who have made these pilgrimages
in the last three years, fewer than 400 have returned to the surface.
The Path of Echoes describes this as "ascension." Authorities have
been largely unable or unwilling to investigate, citing jurisdictional
issues with the inner world.

Frank's notes in the margins:
"They're not ascending. They're being harvested. Resources are finite
down there. Surface converts are labor, test subjects, breeding stock.
The Echoes are a recruitment pipeline disguised as salvation."
`;

const EXPEDITION_1 = `EXPEDITION REPORT — PROMETHEUS VII
=====================================
Lead: Dr. Elena Vasquez
Team: 14 members, including Frank Nicholas and Daniel Vega
Duration: 18 days
Location: Sector 7 (Western Cavern Network)

SUMMARY:
First contact protocols established. The inner people in Sector 7
are willing to communicate via written exchange. They use translation
tablets — thin slate-like devices that display text in the reader's
language.

Notable: the translation tablets don't appear to be powered by any
recognizable energy source. The inner people seem confused by the
question of "how they work." One wrote: "They mean what they mean.
What else would they do?"

The cities here are built vertically along cavern walls — architecture
that seems to grow rather than be constructed. Buildings appear to be
extruded from the rock itself.

Personal note (Frank): The silence here is overwhelming and beautiful.
No one talks. No one needs to. I've never felt so alone and so
fascinated at the same time.
`;

const EXPEDITION_2 = `EXPEDITION REPORT — PROMETHEUS IX
=====================================
Lead: Dr. Elena Vasquez
Team: 11 members, including Frank Nicholas and Daniel Vega
Duration: 26 days
Location: Sector 12 (Eastern Temple Complex)

SUMMARY:
Discovered a large temple structure. The inner people identify it as
a "teaching place" — but not for children. For surface visitors.

The temple belongs to the Path of Echoes. Inside, we found extensive
written records — historical accounts, religious texts, and what
appears to be a registry of "unawakened ones": children born to inner
people who were raised on the surface.

The inner people at the temple were notably less welcoming than those
in Sector 7. One of them — older, wearing a spiraled metallic band
around their forehead — stared at me for what felt like an hour. They
wrote nothing. Just... watched.

Danny was agitated the entire time. Said the place felt "wrong." I
couldn't disagree, but for different reasons. I need to understand
what they're doing here.

I managed to copy fragments of several texts before we left. I don't
think they noticed. Or if they did, they didn't care.
`;

const EXPEDITION_3 = `EXPEDITION REPORT — PROMETHEUS XII
=====================================
Lead: Dr. Marcus Chen (Vasquez recalled to surface)
Team: 8 members, including Frank Nicholas and Daniel Vega
Duration: 31 days
Location: Sector 12, return visit

SUMMARY:
This was my third trip to the Temple Complex. Danny refused to come
inside this time — waited at base camp. I went alone.

I met someone. They call themselves Kael. They're not like the others.

Kael speaks. Or rather — Kael can write at a speed I've never seen.
Whole paragraphs appear on the tablet before I've finished reading
the first line. They're intelligent, patient, and deeply embedded in
the Path of Echoes hierarchy.

Kael confirmed something I'd suspected: the Echoes are not just a
religion. They're a system. The inner world's resources are finite.
Energy from the Inner Sun is weakening. Food production is declining.
The Echoes bring surface people below — converts, pilgrims, the
desperate and gullible — and they never leave.

Kael told me about the unawakened ones. Children of inner people
who were placed on the surface — some intentionally, some by accident
during early expeditions. The Echoes track them. Kael knows their
names. Kael knows where they live.

When I asked why the Echoes track them, Kael wrote:
"They carry what we are. Unused. It is... a waste."
`;

// =============================================================================
// CONTENT — SACRED TEXTS
// =============================================================================

const TEXT_FRAGMENT = `PATH OF ECHOES — FRAGMENT 47 (TRANSLATED)
============================================

"...and so the divided walk among the blind, carrying the gift they
do not know they carry. Their blood remembers the source. Their
minds dream in the old language, though they wake with no memory
of the dreaming.

To return the divided to the source is the sacred duty. To awaken
what sleeps in their blood is the purpose of the Path. Seek them
where they hide among the silent-mouthed. They will know you not,
and their not-knowing is their tragedy.

But the seeker who offers the divided one —
        [text damaged]
—shall find their own silence broken. The gift given becomes the
gift received. One becomes two. Two become whole."
`;

const TEXT_RITUAL = `PATH OF ECHOES — THE RITE OF SILENT COMMUNION
=================================================

[Translated from the original Echo script by Frank Nicholas]

The rite shall be performed in the Chamber of Echoes,
at the point where the Inner Sun's light touches the
altar stone at the zenith hour.

The divided one must be brought willingly or by force.
The divided one must be of the blood of the inner world
but raised in the world of noise.

The seeker shall speak these words in the language of
sound — for this alone among our rites uses sound:

"I return what was scattered. I take what was withheld.
Let the silence end. Let the divided become one."

The blood of the divided one shall touch the altar stone.
When the stone drinks, the seeker shall receive the gift
of silence — the silent tongue, the shared thought, the
communion of minds.

[Additional notation in the margin, in Frank's handwriting:
"The divided one does not survive the ritual. The text
is vague on this point but the mechanics are clear. The
ability transfers. The host does not."]
`;

const FRANK_TRANSLATION = `FRANK'S INTERPRETIVE NOTES
==========================

The Echo texts use "divided one" to describe people with inner-world
heritage who were raised on the surface. Their telepathic ability is
present but dormant — "unawakened," as Kael calls it.

The Rite of Silent Communion is, in plain terms, a murder ritual with
a specific purpose: transferring telepathic ability from an unawakened
person to someone without it.

Key requirements:
1. The target must have inner-world blood (born to inner-world parents)
2. The target must have been raised on the surface (ability dormant)
3. The ritual must be performed in the Chamber of Echoes
4. The target's blood must touch the altar stone

If successful, the "seeker" (me) gains telepathic ability.

Implications:
- I would become capable of communication with inner people
- I could integrate into inner-world society
- I could work from within to expose and disrupt the Path of Echoes
- The cost is one life: Chiara's

Moral calculus: the Echoes have already claimed over 3,800 surface
people. That number grows every month. If I can stop the recruitment
pipeline by gaining access from within — one life is a small price.

But I know I'm rationalizing. I've wanted her since the first time
I saw her. The ritual lets me have her AND become what I envy. It's
not noble. It's convenient.

I don't know if I care about the difference anymore.

Danny can never know. He'd try to stop me — not out of concern for
Chiara, but because he'd see it as another way the inner world has
poisoned someone he cares about. He's not wrong. But he's not right
either.
`;

// =============================================================================
// CONTENT — MESSAGES
// =============================================================================

const DANNY_1 = `FROM: danny_vega@[redacted]
TO: frank_nicholas@[server]
DATE: April 12th

Frank —

Got your message about the next expedition. I'm in. Vasquez asked
for us specifically — said we handle the inner people better than
most of her team. I think she just wants people who won't panic.

You asked about the silence down there. It's... hard to describe.
It's not just quiet. It's like the air itself is waiting for
something. The inner people look at you and you KNOW they're
communicating — you can almost feel it, like pressure behind your
eyes — but nothing comes through. It's the loneliest feeling in
the world.

But you know what? Better lonely down there than up here watching
everything fall apart. These new religions popping up everywhere —
people worshipping the inner world like it's the goddamn promised
land. They have no idea what's really down there.

See you at base camp.

— Danny
`;

const DANNY_2 = `FROM: danny_vega@[redacted]
TO: frank_nicholas@[server]
DATE: September 3rd

Frank —

I saw you at the Echo temple again last week. Third time. What are
you looking for in there?

You know how I feel about this. The Path of Echoes isn't some
fascinating anthropological puzzle. It's a cult. They're brainwashing
people. Thousands of surface people have gone down there and never
come back, and everyone just... accepts it? "They've ascended"?
Bullshit.

I've been in those caverns. I've seen the way the inner people look
at us — not with curiosity, with calculation. They don't see us as
equals. We're resources to them. The Echoes are just a nice wrapper
on a recruitment operation.

I'm saying this as your friend: be careful what you get involved with.
Whatever you're looking for in those texts, it's not going to give you
what you want.

— Danny
`;

const DANNY_3 = `FROM: danny_vega@[redacted]
TO: frank_nicholas@[server]
DATE: November 20th

Frank —

It's been five days since anyone heard from you. Elena said you missed
the debrief. Marcus said you went back to the temple alone on the last
day of Prometheus XII.

I went by your apartment. Nothing. Your neighbor said you left with
a bag a week ago and haven't been back.

Look, I don't know what's going on with you. You've been different
since the third expedition. Distant. Obsessive. You stopped talking
about anything except the Echoes and that girl — Chiara something,
the one you've been... watching.

Frank, if you're reading this — call me. Message me. Something.
Whatever you're planning, we can figure it out together.

If you went back down there... just come back, man.

— Danny
`;

const KAEL_1 = `FROM: kael@[inner-relay]
TO: frank_nicholas@[server]
DATE: October 18th
[translated from Echo script]

Frank Nicholas.

You have been reading our texts. You have been to the Temple three
times. You ask questions the others do not ask. This is noted.

I am called Kael. I serve the Path, though not in the way you might
assume. The Path has many branches. Some are visible. Some are not.

You are looking for something. I can help you find it.

But you must understand: knowledge from the inner world is not given.
It is exchanged. What do you offer in return?

— Kael
`;

const KAEL_2 = `FROM: kael@[inner-relay]
TO: frank_nicholas@[server]
DATE: October 29th
[translated from Echo script]

Frank —

The woman you described. The one whose eyes are "too old for her face."
The one who dreams of cities in cavern walls.

Her name is Chiara Maria. She is in the registry. Her birth parents
were inner-world dwellers — researchers who came to the surface during
the early expeditions, before the borders closed. They died when she
was an infant. She was placed with surface guardians. The guardians
were told nothing.

She is an unawakened one. The gift is in her blood, dormant. It will
remain dormant unless she is brought to the inner world and taught —
or unless someone performs the Rite.

I know what you are considering, Frank. I can see the shape of your
thoughts even without the gift. You want to take it from her. You
want to become what she is.

I can help you. The Chamber of Echoes is real. The Rite is real.
I can prepare the way.

But you must understand what you are asking. Once the Rite is
performed, there is no undoing. You will carry what she was inside
you forever. You will hear her silence in your own.

Are you prepared for that?

— Kael
`;

const KAEL_3 = `FROM: kael@[inner-relay]
TO: frank_nicholas@[server]
DATE: November 10th
[translated from Echo script]

Frank —

I have told you the truth about the Path. You deserved to know.

The inner world is dying. The Inner Sun dims a little more each year.
Our crops fail in sectors that were fertile a generation ago. Our
population declines — fewer children are born each cycle, and fewer
survive.

The Path of Echoes recruits surface people because we need them. Their
labor. Their bodies. Their genetic diversity. The religion is elegant —
it makes them come willingly. They believe they are ascending. In a
sense, they are not wrong. They become part of something larger than
themselves. They serve a purpose.

Is this cruel? Perhaps. But survival is not concerned with cruelty.

The unawakened ones — Chiara and others like her — are different. They
carry the gift unused while we face extinction. The Rite was created
for this purpose: to reclaim what was lost. Every unawakened life
sacrificed strengthens one of us. It is not murder. It is reclamation.

You want to use the Rite for your own purposes. To gain the gift and
then work against us. I know this. I have known from the beginning.

I am helping you anyway. Do you know why?

Because you are not wrong either. What the Path does is brutal. Maybe
it is necessary. Maybe it is not. I have served long enough to wonder.
If someone from the surface — someone who has seen what we do — can
become one of us and challenge the Path from within... perhaps that is
what we need.

Or perhaps you will fail and we will reclaim another unawakened one
through you. Either way, the Path continues.

Come to the Chamber of Echoes when you are ready. Bring the divided
one. I will be waiting.

— Kael
`;

// =============================================================================
// CONTENT — CHIARA
// =============================================================================

const CHIARA_STALKING = `CHIARA MARIA — OBSERVATION LOG
=====================================

Compiled by Frank Nicholas over 7 months of surveillance.

BASIC INFO:
- Full name: Chiara Maria
- Age: 27
- Occupation: Journalist, [redacted press organization]
- Residence: Apartment 4B, 1217 Calle Luna, [city redacted]
- Known associates: coworker Mehmet Oconitrillo (casual)

DAILY ROUTINE:
- 07:40 — Leaves apartment
- 07:55 — Metro, Line 3, Car 4 (always same car)
- 08:12 — Arrives at café across from office
- 08:15 — Orders oat milk latte, no sugar, tips exactly €1 in coins
- 08:25 — Enters office building
- 12:30 — Lunch, usually alone, park bench near the fountain
- 18:15 — Leaves office
- 18:35 — Returns home (occasionally stops at grocery on Calle Mayor)

ANOMALIES:
- Does not know her biological parents (claimed in office conversation,
  overheard Aug 3)
- Birth certificate lists Santa Maria Hospital — that hospital burned
  down in 1990, six months before her listed birth date
- Adoption records sealed by Thornton & Associates, a law firm that
  dissolved in 1998 with no successor
- Told a coworker (March 14) she "sometimes knows what people are going
  to say" — dismissed as a joke
- Described a dream (April 22, overheard at café) about "a city built
  into a cave wall, with a tiny sun hanging in the middle of the sky"
  — matches descriptions of Sector 7 inner-world architecture exactly

CONCLUSION: Chiara Maria is an unawakened one. Child of inner-world
parents, placed on the surface in infancy. Target for the Rite.
`;

const CHIARA_HERITAGE = `EVIDENCE SUMMARY — CHIARA MARIA'S INNER-WORLD HERITAGE
========================================================

Compiled by Frank Nicholas. Cross-referenced with Path of Echoes registry
data (provided by Kael) and surface records.

1. ECHO REGISTRY MATCH
   The Path of Echoes registry of "unawakened ones" lists a female
   child, born to inner-world researchers Ilya and Sera [surname
   untranslatable], placed on the surface in 1996 following the
   parents' deaths. Registry ID: UW-0471. Physical description,
   date of birth, and placement location all match Chiara Maria.

2. ADOPTION IRREGULARITIES
   Chiara's adoption was handled by a defunct law firm with no
   verifiable history. The adoption agency listed on her paperwork
   has no records of her case. Her adoptive parents (both deceased
   as of 2019) appear never to have been formally approved as
   adoptive guardians in any jurisdiction.

3. BEHAVIORAL MARKERS
   Unawakened ones often display subtle telepathic intuition —
   "knowing" what someone will say, heightened empathy, unusually
   accurate first impressions. Chiara displays all three. She also
   has recurring dreams consistent with inner-world imagery.

4. PHYSICAL MARKERS (UNCONFIRMED)
   Inner-world humans share a rare mitochondrial DNA sequence
   not found in surface populations. If Chiara were tested, this
   would provide definitive proof. No test has been performed.

ASSESSMENT: Beyond reasonable doubt. Chiara Maria is a child of the
inner world. Her gift is dormant. The Rite of Silent Communion would
transfer it to the seeker.
`;

// =============================================================================
// CONTENT — RESOLVE
// =============================================================================

const RESOLVE = `You've pieced it all together.

Frank Nicholas is obsessed with Chiara Maria. He's been stalking her
for months. He believes she's a child of the inner world — born to
inner-world parents who died on the surface, carrying dormant
telepathic abilities she doesn't know she has.

Frank discovered a ritual in the Path of Echoes religion. The Rite of
Silent Communion. It would let him kill Chiara and take her telepathic
ability for himself. With it, he could infiltrate the inner world and
try to stop the Echoes from exploiting surface people.

But Frank is missing. His last diary entry says he left to find Chiara
and bring her to the Chamber of Echoes. Danny hasn't heard from him.
Kael is waiting for him below.

Chiara doesn't know any of this. She doesn't know what she is. She
doesn't know someone is planning to kill her. She doesn't know you've
been reading her stalker's private files.

And you — Mo — you work with her. You see her every day. You've been
watching her too, in your own way. Now you know her life is in danger.

Frank has his reasons. Stopping the Echoes might save thousands. But
it would cost Chiara's life — a life she never asked to be part of this.

What do you do?
`;

// =============================================================================
// CONTENT — ENDINGS
// =============================================================================

const ENDING_SAVE = `You warned her.

It took three conversations. The first one, she thought you were crazy.
The second one, she was scared — not of you, but of how much the
evidence fit. The third one, she cried. Not for Frank. For the parents
she never knew. For the life she could have had.

You showed her everything: the diary entries, the expedition reports,
Kael's messages, the sacred texts. You watched her face as she realized
what she was — and what Frank planned to do to her.

She's not the same person anymore. How could she be? But she's alive.

Together, you've started working on awakening her abilities. It's slow.
There's no manual for this. But sometimes, when you're sitting across
from her and she looks at you, you feel something — not words, not
exactly, but a pressure behind your eyes. Like someone is trying to
speak. Like the silence is learning to break.

Frank is still out there. Kael is still waiting. The Path of Echoes is
still recruiting. But Chiara knows the truth now, and she's not going to
hide from it.

Whatever happens next, you'll face it together.
`;

const ENDING_SILENCE = `You stayed silent.

You closed the server and never opened it again. You deleted the access
logs. You went back to work the next day like nothing had changed.

Chiara was at her desk when you walked in. She smiled at you — the same
smile she gives everyone. Oat milk latte on her desk. Same as always.

You thought about saying something a hundred times. In the elevator.
At lunch. When she asked if you wanted to grab coffee. Each time, the
words died in your throat.

You don't know if Frank found her. You don't know if the ritual was
performed. Danny hasn't mentioned Frank in weeks. You're afraid to ask.

Maybe you were right to stay silent. Frank's plan — if it works — could
stop the Path of Echoes. Thousands saved. One life traded. The math
makes sense on paper.

But the math doesn't help you sleep at night. The math doesn't stop
you from flinching every time Chiara doesn't show up to work on time.

You made your choice. Now you live with it.
`;
