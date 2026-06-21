import { createDirectoryStructure, type Directory } from "../files";
import type { Storyline } from "../storyline";

const storyline: Storyline = {
    id: "libertine",
    name: "The Libertine's Ledger",
    description:
        "Vincenzo keeps meticulous records of every woman he's taken to bed. His private server holds the details — and the scandal that could destroy him.",

    buildFilesystem(): Directory {
        const rootDir = createDirectoryStructure("$ROOT");
        const root = rootDir.root;

        // =========================================================================
        // WELCOME
        // =========================================================================

        root.createFile("welcome.txt", WELCOME, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { vault_key: 1 } });
                ctx.log(
                    "story",
                    "You've breached Vincenzo Rossi's private server. The welcome message alone is... revealing.",
                );
                ctx.log("milestone", "The vault is now unlocked. Vincenzo's diaries and gallery await.");
                ctx.log("goal", "Open the diary. Let's see what this man has been up to.");
            },
        });

        // =========================================================================
        // DIARY — the core content, locked behind vault_key
        // =========================================================================

        const diary = root.createDirectory("diary", { key: "vault_key" });
        diary.createFile("001_the_gallerist.txt", DIARY_01, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Vincenzo's first recorded conquest. The gallerist. Italian, married, intense. He writes like a romance novelist with no filter.",
                );
            },
        });
        diary.createFile("002_the_twins.txt", DIARY_02, {
            onRead(ctx) {
                ctx.log("story", "Twins. At the same time. Vincenzo describes the logistics. In detail.");
            },
        });
        diary.createFile("003_the_airbnb_host.txt", DIARY_03, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { ledger_key: 1 } });
                ctx.log(
                    "story",
                    "A weekend rental turned into something else entirely. The host, her friend, and a bottle of grappa.",
                );
                ctx.log(
                    "milestone",
                    "Found a reference to Vincenzo's ledger. It seems he kept more than just diaries.",
                );
                ctx.log("goal", "Find the ledger — Vincenzo's rating system for his conquests.");
            },
        });
        diary.createFile("004_the_conference.txt", DIARY_04, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "A tech conference in Milan. Three days, four women. Vincenzo considers this his personal best.",
                );
            },
        });
        diary.createFile("005_the_politician.txt", DIARY_05, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "A regional politician. Married. Very specific tastes. Vincenzo took notes for leverage.",
                );
                ctx.log(
                    "goal",
                    "This is getting darker. Check the ledger for connections between his affairs and his business.",
                );
            },
        });
        diary.createFile("006_the_intern.txt", DIARY_06, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/evidence" });
                ctx.log(
                    "story",
                    "The intern. She was 22. Vincenzo was her boss. He tells the story like it was mutual — but the details suggest otherwise.",
                );
                ctx.log(
                    "milestone",
                    "A hidden evidence folder has been revealed. Something here isn't just scandalous — it might be criminal.",
                );
                ctx.log("goal", "Open the evidence folder. Find out what really happened with the intern.");
            },
        });
        diary.createFile("007_reflections.txt", DIARY_07, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Vincenzo's reflections on his 'collection.' He sees women as acquisitions. The language is cold — and honest.",
                );
            },
        });

        // =========================================================================
        // GALLERY — locked
        // =========================================================================

        const gallery = root.createDirectory("gallery", { key: "vault_key" });
        gallery.createFile("favorites.txt", GALLERY_FAVORITES, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Vincenzo's annotated photo descriptions. He writes about women like he's reviewing restaurants.",
                );
            },
        });
        gallery.createFile("the_collection.txt", GALLERY_COLLECTION, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "A catalog of every woman he's photographed. Names, dates, locations. The sheer volume is staggering.",
                );
            },
        });

        // =========================================================================
        // MESSAGES — some locked, some accessible
        // =========================================================================

        const messages = root.createDirectory("messages");
        messages.createFile("lucia_chat.txt", MSG_LUCIA, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Chat logs with Lucia, a 34-year-old divorcee. The escalation from flirting to explicit photo exchange to a weekend in Sardinia.",
                );
            },
        });
        messages.createFile("valentina_chat.txt", MSG_VALENTINA, {
            key: "vault_key",
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Valentina — the politician. These messages read like a negotiation. Vincenzo got what he wanted.",
                );
            },
        });
        messages.createFile("francesca_chat.txt", MSG_FRANCESCA, {
            key: "vault_key",
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Francesca, the gallerist's assistant. She had no idea Vincenzo was also sleeping with her boss.",
                );
            },
        });

        // =========================================================================
        // THE LEDGER — locked behind ledger_key, obtained from diary entry 003
        // =========================================================================

        const ledger = root.createDirectory("ledger", { key: "ledger_key" });
        ledger.createFile("black_book.txt", BLACK_BOOK, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Vincenzo's rating system. Name, age, occupation, appearance score, performance score, 'leverage potential,' and whether he'd repeat.",
                );
            },
        });
        ledger.createFile("business_connections.txt", BUSINESS, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Map of how each affair connected to a business deal. The politician's husband runs a construction firm that got a city contract. The gallerist introduced Vincenzo to her wealthy clients. This isn't just sex — it's strategy.",
                );
            },
        });

        // =========================================================================
        // EVIDENCE — hidden, revealed by diary entry 006
        // =========================================================================

        const evidence = root.createDirectory("evidence", { hidden: true });
        evidence.createFile("intern_statement.txt", INTERN_STATEMENT, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "The intern's own words. She didn't want it. She was afraid of losing her job. Vincenzo knew.",
                );
            },
        });
        evidence.createFile("vincenzo_draft.txt", VINCENZO_DRAFT, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "A draft email Vincenzo never sent — threatening the intern if she talked. The language is chilling.",
                );
            },
        });

        // =========================================================================
        // THE CHOICE — hidden, revealed by reading the evidence
        // =========================================================================

        root.createFile("the_choice.txt", THE_CHOICE, {
            hidden: true,
            onRead(ctx) {
                ctx.log("milestone", "You've seen it all. The conquests, the ledger, the coercion. Now you choose.");
                if (ctx.state.gamePhase < 90) {
                    // Reveal choice on first read
                }
            },
            choices: [
                {
                    label: "Leak everything. The press, the police, his wife — everyone.",
                    action: { type: "SET_PHASE", payload: 99 },
                },
                {
                    label: "Blackmail him. If he's been using women, you can use him.",
                    action: { type: "SET_PHASE", payload: 98 },
                },
                {
                    label: "Confront him privately. Destroy the evidence. Let him live with the fear.",
                    action: { type: "SET_PHASE", payload: 97 },
                },
            ],
        });

        // Ending files
        root.createFile("ending_expose.txt", ENDING_EXPOSE, {
            hidden: true,
            onRead(ctx) {
                if (ctx.state.gamePhase >= 99) {
                    ctx.log(
                        "story",
                        "ENDING: You leaked everything. The politician resigned within a week. Vincenzo was arrested — not for the affairs, but for the coercion. The intern went public. His wife filed for divorce. His empire crumbled. You watch the news coverage from your laptop and feel... something between satisfaction and nausea. You exposed a predator. But you also exposed women who never wanted their private lives made public. Was it worth it? You tell yourself yes.",
                    );
                }
            },
        });
        root.createFile("ending_blackmail.txt", ENDING_BLACKMAIL, {
            hidden: true,
            onRead(ctx) {
                if (ctx.state.gamePhase >= 98) {
                    ctx.log(
                        "story",
                        "ENDING: You contacted Vincenzo through an encrypted channel. He paid. He paid a lot. You've set up recurring payments — silence isn't cheap. Every month, the money arrives. Every month, he wonders if this is the month you leak anyway. The power feels good. But the intern still works in his office. She still flinches when he walks past her desk. You tell yourself you'll do something about that. Eventually.",
                    );
                }
            },
        });
        root.createFile("ending_confront.txt", ENDING_CONFRONT, {
            hidden: true,
            onRead(ctx) {
                if (ctx.state.gamePhase >= 97) {
                    ctx.log(
                        "story",
                        "ENDING: You showed up at his office unannounced. Dropped a USB drive on his desk. 'I've seen everything. The diaries. The ledger. The intern.' He went pale. You told him: resign from the company, leave the country, or you release it all. He chose to leave. The intern kept her job. The politician never faced consequences. Justice is partial, but the predator is gone. You deleted the files — mostly. You kept a copy. Just in case.",
                    );
                }
            },
        });

        return root;
    },

    getInitialInventory() {
        return {};
    },

    getInitialLogEntries() {
        const now = Date.now();
        return [
            {
                id: `log-${now}-0`,
                timestamp: now,
                category: "story" as const,
                text: "Vincenzo Rossi's private server. The password was his dog's name. Idiot.",
            },
            {
                id: `log-${now}-1`,
                timestamp: now,
                category: "goal" as const,
                text: "Explore Vincenzo's vault. His diaries, his messages, his gallery — find out what he's hiding.",
            },
        ];
    },
};

export default storyline;

// =============================================================================
// CONTENT — WELCOME
// =============================================================================

const WELCOME = `===========================================
VINCENZO ROSSI — PRIVATE VAULT
===========================================
"Every woman is a story. I intend to write them all."
===========================================

Welcome, signore. You have entered my private collection.

Here you will find detailed records of every woman
I have had the pleasure of knowing — intimately.

The diary entries are candid. The photos are explicit.
The messages are unredacted. The ledger is... comprehensive.

I trust you will exercise discretion.

If you are not me, and you are reading this —
I hope you enjoy the show.

— V
`;

// =============================================================================
// CONTENT — DIARY ENTRIES
// =============================================================================

const DIARY_01 = `Entry 001 — The Gallerist
Date: March 14th
Name: Alessandra B.
Occupation: Gallery owner, Milan
Status: Married (husband travels often)

She invited me to a private viewing. The art was forgettable.
She was not.

Alessandra is 41. Tall, dark hair that falls past her shoulders,
a body that belongs in a Caravaggio painting. She wore a black
dress that unzipped from the back — I discovered this when she
asked me to "help" her after spilling champagne.

We didn't make it to the bedroom. The gallery floor. Then the
desk. Then the leather chaise in her office. She was loud —
the kind of loud that makes you forget there's a world outside.

What she lacks in frequency she compensates with intensity.
She called me "ragazzo" while I had her bent over her own desk,
her dress pooled around her ankles, her wedding ring catching
the light from the streetlamp outside.

Afterward, she fixed her lipstick in a gilded mirror and said:
"I don't usually do this."

I almost laughed. The things we tell ourselves.

Rating: 9/10. Would repeat — her husband is in London next month.
`;

const DIARY_02 = `Entry 002 — The Twins
Date: April 2nd
Names: Elisa and Martina C.
Occupation: Fashion models, 23
Status: Single (both), "experimenting"

I met Elisa at a club opening. She brought her sister Martina
to our second date. "I hope you don't mind," she said. She knew
exactly what she was doing.

They have identical bodies — long legs, small breasts, curves
in all the right places — but completely different temperaments.
Elisa is dominant, directive: "Stay there. Don't move. Watch."
Martina is softer, more responsive, gasping at every touch.

The logistics of pleasing two women simultaneously are more
challenging than one might expect. I learned quickly. Elisa
guided Martina's head while I was behind her, and the sight —
my god, the sight of these two identical women, one buried in
the other while I took my turn — is burned into my memory
with absolute clarity.

At one point they kissed each other while I was inside Elisa
from behind, and Martina reached down to touch herself while
watching us. The coordination. The showmanship. They've done
this before. I was not their first — but I was certainly their
most appreciative.

We ordered pizza afterward. Martina ate hers naked on my couch,
legs crossed, totally comfortable. Elisa fell asleep with her
head on my chest. I lay there thinking: this is what the gods
must feel like.

Rating: 10/10. The bar has been raised considerably.
`;

const DIARY_03 = `Entry 003 — The Airbnb Host
Date: May 18th
Name: Giulia R. and her friend "Sofia" (probably not her real name)
Occupation: Giulia runs vacation rentals in Tuscany
Status: Giulia — divorced. Sofia — "it's complicated."

I booked a weekend villa in the hills. Giulia met me at the
door with a bottle of her uncle's grappa. She's 38, sun-weathered
in the way Tuscan women get from a life outdoors, strong hands,
a laugh that fills the room.

Her friend Sofia arrived "by coincidence." Within an hour we
were in the hot spring behind the villa, the three of us, and
Giulia's hand found my thigh underwater while Sofia pretended
not to notice.

The details of that night blur in the best way. I remember
Giulia's mouth, experienced and unhurried. I remember Sofia's
surprising eagerness once she stopped pretending to be shy.
I remember the three of us tangled in the enormous bed, the
windows open to the Tuscan night, the sound of cicadas mixing
with sounds I won't describe here — but you can imagine.

Giulia whispered something in my ear around 3 AM: "You should
see what happens when my other friends visit."

I might book another weekend.

Rating: 8/10. The grappa was terrible but the company was divine.
Note to self: check the ledger — Giulia has connections to the
wine distribution deal I've been working on.
`;

const DIARY_04 = `Entry 004 — The Conference
Date: June 7th-9th
Location: Tech Summit, Milan
Multiple encounters — four women across three days

DAY ONE
The marketing executive from Barcelona. 34, sharp, a smoker.
We met at the hotel bar. By midnight she was on her knees in
my suite, and I learned that Spanish women do not waste time
on preamble. She was insatiable — three times before sunrise.
I walked her back to her room at 6 AM. We passed hotel staff
in the hallway. She didn't even bother fixing her hair.

DAY TWO
The startup founder. 29, intense, argues about everything.
We argued about SaaS valuations over lunch. We argued about
the hotel sheets two hours later. She wanted to be in control.
I let her. When she took what she wanted, her whole face
changed — the tension dissolved, replaced by something almost
innocent. She fell asleep immediately afterward. I ordered
room service and woke her up for round two.

The journalist. 31, cynical, drinks whiskey neat. She
interviewed me for a tech blog. The interview continued in
my room. She asked very personal questions. I gave very
personal answers. She took notes between positions.

DAY THREE
The venture capitalist's wife. I will not name her. She found
me at the closing party, said she'd noticed me all weekend.
"I have four hours before my husband's flight lands." We used
three of them.

Total: four women, three days. Personal best.
Rating: 9/10 aggregate. The VC's wife was the highlight —
something about forbidden fruit, I suppose.
`;

const DIARY_05 = `Entry 005 — The Politician
Date: July 22nd
Name: Deputy Mayor Valentina G.
Occupation: Regional government
Status: Married, two children, very Catholic

She is not my usual type. Older, 47, severe hairstyle, dresses
like a nun. But I noticed the way she looked at me during the
chamber of commerce dinner — a flicker of something hungry
beneath the public persona.

I pursued. She resisted. I persisted.

The first time was in her office, after hours. She locked the
door and transformed — the severe hair came down, the blouse
came off, and underneath was a body she clearly works very hard
on, and underwear that cost more than my first car. Red lace.
She guided my hands exactly where she wanted them.

"You tell anyone about this and I will destroy you," she
whispered while undoing my belt.

"I would expect nothing less," I replied.

She has specific tastes. She likes to be talked through it —
detailed narration of what I'm doing, what I'm going to do,
what she feels like. "Tell me," she kept saying. "Tell me
exactly what you're doing to me." I obliged. She rewarded
my eloquence enthusiastically.

Three times now. Each more intense than the last. Last week
she cried afterward — not from sadness, she said, but from
"release." I held her while she composed herself. Then she
fixed her hair, put the severe blouse back on, and walked
out like nothing happened.

Her husband owns a construction firm. They're bidding on the
new civic center contract. I made a note in the ledger.

Rating: 7/10 physically, 10/10 strategically. Continue.
`;

const DIARY_06 = `Entry 006 — The Intern
Date: August 30th
Name: Giada M.
Occupation: Intern at Rossi Enterprises
Status: Single, 22, first real job

This one... I have complicated feelings about this one.

She started in June. Bright, eager, dresses like she's still
in university. She laughed at all my jokes. She stayed late
when I asked. She looked at me like I was important.

The first time was in my office, after a client dinner. She'd
had two glasses of wine. I'd had three. We were going over
presentations and then we weren't going over presentations.

She was nervous. Trembling. I told myself it was excitement.
She didn't say no — but she didn't say yes, either. She just...
didn't stop me. When it was over she fixed her skirt, gathered
her things, and left without meeting my eyes.

The next day she acted normal. Too normal. She avoids being
alone with me now, but she's still polite. Still professional.
Still here.

I've replayed that night many times trying to convince myself
it was fine. She was into it. She wanted it. That's what I
wrote in my first draft of this entry — a version where she
was an eager participant, another conquest in the collection.

But I deleted that draft. Because it's not true. She was scared.
She was my employee. And I used that.

This entry stays in the vault — it's not for the collection.
It's for me. A reminder that the line exists, and I crossed it.

I don't know what to do with this feeling. So I'm writing it
down and locking it away like I do everything else.
`;

const DIARY_07 = `Entry 007 — Reflections
Date: September 15th

I've been reading back through the earlier entries. The gallerist.
The twins. The Airbnb host. The conference. They read like
trophies — and that's what they were. Trophies. Collected, rated,
filed away in my little ledger like inventory.

Alessandra: 9/10. Would repeat.
Elisa and Martina: 10/10. Unlikely to top.
Giulia: 8/10. Strategic value.

I reduced them to numbers. To positions. To what they let me do.

But what did I give them? A night? An orgasm? A story to tell
their friends? Some of them wanted exactly that — the release,
the adventure, the no-strings night with a man who knew what he
was doing. I don't regret those. We gave each other what we wanted.

Others... Giada. The intern. I didn't give her anything. I took.
The distinction matters. I've been telling myself otherwise for
months, but the diary doesn't lie, and I can't edit the memory.

This collection is supposed to be a celebration. A record of a
life lived fully. But reading it from start to finish, I see the
arc clearly — from genuine mutual pleasure to... something else.
Something hungrier. Something that stopped caring about the
woman on the other side of the bed.

I'll keep writing. What else can I do? The collection is who I am.
But maybe this entry should be the first thing in the vault, not
the last. A warning label on the bottle.
`;

// =============================================================================
// CONTENT — GALLERY
// =============================================================================

const GALLERY_FAVORITES = `FAVORITE PHOTOGRAPHS — ANNOTATED
=========================================

001 — "La Gallerista"
Alessandra, taken from behind as she looked out her gallery window.
The morning light cuts across her shoulder blades. She's wearing
only my shirt, unbuttoned. The wedding ring is visible on the hand
resting against the glass. I love this photo because she looks
completely unguarded — a woman who spends her life curating
appearances, captured in a moment of pure, private authenticity.

006 — "Le Gemelle"
Elisa and Martina asleep on my bed, limbs intertwined like a
Renaissance painting of angels. Their identical profiles facing
each other, mirror images. You can't tell where one ends and the
other begins. I took this at dawn, before they woke.

012 — "Il Politico"
Valentina, in her office, the city visible through the window
behind her. She's fully dressed in this one — severe blazer,
tight bun. But her cheeks are flushed and her lips are slightly
parted. She'd just told me to lock the door. The anticipation
in her expression is more erotic than any nude could be.

019 — "La Toscana"
Giulia in the hot spring, steam rising around her, head tilted
back, the Tuscan hills behind her. The water is just opaque
enough to suggest everything and reveal nothing.
`;

const GALLERY_COLLECTION = `COMPLETE COLLECTION INDEX
=============================

Alessandra B. — 14 photos, 2 videos (March 14 - ongoing)
Elisa C. — 23 photos, 4 videos (April 2 - ongoing)
Martina C. — 18 photos, 3 videos (April 2 - ongoing)
Giulia R. — 8 photos (May 18-19)
Sofia [pseud.] — 5 photos (May 18-19)
Marketing Exec, Barcelona — 4 photos (June 7)
Startup Founder — 7 photos (June 8)
Journalist [name redacted] — 3 photos (June 8)
VC's Wife — 2 photos (June 9)
Valentina G. — 11 photos, 1 video (July 22 - ongoing)
Giada M. — 0 photos. 0 videos. Not for the collection.
Lucia D. — 16 photos, 2 videos (ongoing)
Francesca T. — 6 photos (ongoing)

Total: 117 photos, 12 videos. 12 women.
`;

// =============================================================================
// CONTENT — MESSAGES
// =============================================================================

const MSG_LUCIA = `CHAT LOG — LUCIA D.
=====================

[March 21, 22:14]
Vincenzo: The restaurant was incredible, but the company was better.
Lucia: You're smooth, I'll give you that.
Vincenzo: I mean it. When can I see you again?
Lucia: Wednesday?
Vincenzo: Too far. Tomorrow?
Lucia: Hah. Eager.
Vincenzo: You have no idea.

[March 22, 01:27]
Lucia: Still awake?
Vincenzo: Thinking about you.
Lucia: Thinking what exactly?
Vincenzo: Thinking about that dress you wore tonight. And what was under it.
Lucia: Bold assumption that anything was under it.
Vincenzo: ...was anything?
Lucia: [photo attachment: mirror selfie, black lace, no dress]
Vincenzo: Jesus Christ.
Lucia: Goodnight, Vincenzo. 😘
Vincenzo: I'm not sleeping now.
Lucia: That's the point.

[March 22, 09:15]
Vincenzo: I haven't stopped thinking about that photo.
Lucia: Good.
Vincenzo: When can I see the real thing?
Lucia: Saturday. My place. Bring wine.
Vincenzo: Red or white?
Lucia: Red. We'll need the energy.

[April 5, 23:42]
Lucia: That thing you did last night. With your tongue.
Lucia: I'm still recovering.
Vincenzo: Which thing? Be specific.
Lucia: The thing where you didn't stop for twenty minutes.
Vincenzo: Ah. That thing.
Lucia: Yes. That thing. Do it again Friday?
Vincenzo: I'm already there.
`;

const MSG_VALENTINA = `CHAT LOG — VALENTINA G. (DEPUTY MAYOR)
==========================================

[July 15, 21:30]
Vincenzo: Deputy Mayor. I enjoyed our conversation at the commerce dinner.
Valentina: Signore Rossi. You were the one who kept refilling my wine.
Vincenzo: You seemed like you needed it.
Valentina: You're observant.

[July 16, 23:11]
Valentina: Do you always message women late at night?
Vincenzo: Only the ones I can't stop thinking about.
Valentina: That line works on younger women. Try again.
Vincenzo: Fair. How about: I saw the way you looked at me when you thought no one was watching.
Valentina: ...better.
Vincenzo: I looked back the same way.

[July 18, 19:45]
Valentina: My office. Thursday. 8 PM. The building will be empty.
Vincenzo: Should I bring anything?
Valentina: Just yourself.
Valentina: And that confidence of yours.
Valentina: We'll see if it's earned.

[July 22, 00:37]
Valentina: You told no one?
Vincenzo: Not a soul.
Valentina: Good. Neither did I. Though my assistant asked why I looked so... relaxed this morning.
Vincenzo: What did you tell her?
Valentina: Yoga.
Vincenzo: [laughing emoji]
Valentina: Don't laugh. You made sounds I've never heard myself make.
Valentina: I'm not complaining.

[August 10, 22:01]
Vincenzo: The civic center contract. Your husband's firm is bidding.
Valentina: This is not the time for business.
Vincenzo: It's always the time for business.
Valentina: [long pause]
Valentina: What are you asking?
Vincenzo: I'm not asking. I'm offering to help. His bid + my connections = guaranteed win.
Valentina: And what do you want in return?
Vincenzo: More of what happened Thursday.
Valentina: You're serious.
Vincenzo: Completely.
Valentina: [pause]
Valentina: Send me the details. But we never had this conversation.
`;

const MSG_FRANCESCA = `CHAT LOG — FRANCESCA T. (GALLERY ASSISTANT)
================================================

[April 18, 14:30]
Francesca: Mr. Rossi? Alessandra asked me to send you the catalog.
Vincenzo: Thank you, Francesca. And please — Vincenzo.
Francesca: Okay, Vincenzo.

[April 22, 19:15]
Vincenzo: The catalog was excellent. But I have questions. Can we discuss over drinks?
Francesca: I'm not sure Alessandra would...
Vincenzo: Alessandra doesn't need to know everything. It's just business.
Francesca: Just business?
Vincenzo: For now.

[April 25, 01:44]
Francesca: I can't believe we...
Vincenzo: I can.
Francesca: Alessandra is my BOSS.
Vincenzo: Alessandra doesn't own you. What you do outside the gallery is your business.
Francesca: She talks about you, you know.
Vincenzo: Does she.
Francesca: She thinks she's the only one.
Vincenzo: What do you think?
Francesca: I think you're dangerous.
Francesca: [photo attachment: her, in bed, sheets barely covering]
Francesca: I think I like it.

[May 3, 16:22]
Francesca: She asked me today if I've seen you.
Vincenzo: What did you say?
Francesca: I said you came by the gallery looking for her. She was out.
Vincenzo: Smart girl.
Francesca: Don't call me girl. I'm 26.
Vincenzo: Smart woman.
Francesca: Better.
Francesca: When can I see you again?
Vincenzo: Tomorrow. My place. 8 PM.
Francesca: I'll be there. With something Alessandra would never wear.
Vincenzo: Tell me.
Francesca: [photo attachment: a shopping bag from an expensive lingerie store]
Francesca: You'll find out tomorrow.
`;

// =============================================================================
// CONTENT — LEDGER
// =============================================================================

const BLACK_BOOK = `THE BLACK BOOK — VINCENZO ROSSI
=====================================

1. Alessandra B.
   Age: 41 | Occupation: Gallery Owner | Status: Married
   Appearance: 9/10 | Performance: 9/10 | Enthusiasm: 8/10
   Leverage: Introductions to her wealthy clients
   Repeat: Yes — ongoing

2. Elisa C.
   Age: 23 | Occupation: Model | Status: Single
   Appearance: 9/10 | Performance: 10/10 | Enthusiasm: 10/10
   Leverage: Minimal. Pure recreation.
   Repeat: Yes — ongoing (with Martina)

3. Martina C.
   Age: 23 | Occupation: Model | Status: Single
   Appearance: 9/10 | Performance: 9/10 | Enthusiasm: 8/10
   Leverage: Minimal. Pure recreation.
   Repeat: Yes — ongoing (with Elisa)

4. Giulia R.
   Age: 38 | Occupation: Vacation Rental Owner | Status: Divorced
   Appearance: 7/10 | Performance: 8/10 | Enthusiasm: 9/10
   Leverage: Wine distribution contacts
   Repeat: Possibly

5. Sofia (pseudonym)
   Age: ~35 | Occupation: Unknown | Status: Unknown
   Appearance: 7/10 | Performance: 7/10 | Enthusiasm: 6/10
   Leverage: None
   Repeat: Unlikely

6. [Marketing Exec — Barcelona]
   Age: 34 | Occupation: Marketing | Status: Single?
   Appearance: 8/10 | Performance: 9/10 | Enthusiasm: 9/10
   Leverage: None — Barcelona
   Repeat: If I'm ever in Barcelona again

7. [Startup Founder]
   Age: 29 | Occupation: CEO | Status: Single
   Appearance: 8/10 | Performance: 8/10 | Enthusiasm: 7/10
   Leverage: Potential investment connection
   Repeat: Maybe

8. [Journalist — Tech Blog]
   Age: 31 | Occupation: Journalist | Status: Unknown
   Appearance: 7/10 | Performance: 8/10 | Enthusiasm: 8/10
   Leverage: Media contact
   Repeat: Probably not

9. [VC's Wife]
   Age: ~36 | Name: REDACTED | Occupation: REDACTED | Status: Married
   Appearance: 9/10 | Performance: 9/10 | Enthusiasm: 10/10
   Leverage: Very high. Do not use unless absolutely necessary.
   Repeat: Dangerous but tempting

10. Valentina G.
    Age: 47 | Occupation: Deputy Mayor | Status: Married
    Appearance: 7/10 | Performance: 7/10 | Enthusiasm: 6/10
    Leverage: CRITICAL — civic center contract
    Repeat: Yes — ongoing. Strategic priority.

11. Giada M.
    Age: 22 | Occupation: Intern | Status: Single
    Appearance: 7/10 | Performance: [REDACTED] | Enthusiasm: [REDACTED]
    Leverage: NONE. DO NOT PURSUE. DO NOT REPEAT.
    Notes: This was a mistake. Handling internally.

12. Lucia D.
    Age: 34 | Occupation: Unknown | Status: Divorced
    Appearance: 8/10 | Performance: 9/10 | Enthusiasm: 10/10
    Leverage: None — purely recreational
    Repeat: Yes — ongoing. Genuinely enjoyable.

13. Francesca T.
    Age: 26 | Occupation: Gallery Assistant | Status: Single
    Appearance: 8/10 | Performance: 8/10 | Enthusiasm: 7/10
    Leverage: Access to Alessandra's client list
    Repeat: Yes — but increasingly risky with Alessandra situation
`;

const BUSINESS = `BUSINESS CONNECTIONS — AFFAIRS AND OPPORTUNITIES
====================================================

Alessandra B. → Art World Access
- Introduced me to three collectors worth >€50M each
- Two have since become Rossi Enterprises clients
- Estimated deal value: €2.4M in commissions
- Ongoing relationship maintains these connections

Valentina G. → Government Contracts
- Husband's firm: G. Construction, annual revenue ~€30M
- Civic center project: €18M contract, currently in bidding
- If I can influence the bid → 10% finder's fee = €1.8M
- Also: regulatory benefits. She sits on the zoning board.

Giulia R. → Wine Distribution
- Her ex-husband runs a mid-size wine distributor
- Distribution deal brokered through Giulia's introduction
- Annual profit: ~€120K

Francesca T. → Internal Intelligence
- Works for Alessandra at the gallery
- Provides information about Alessandra's other... interests
- Useful for maintaining leverage in the Alessandra situation
- Also: genuinely fun

Startup Founder (Conference) → Investment Pipeline
- Her company is raising Series A
- Early access to deal flow
- Potential: unknown but worth tracking

Strategic Summary:
Total attributable revenue from affair connections: ~€4.3M
Active leverage: 3 women
Clean (no leverage, mutual): 5 women
Mistake (do not repeat): 1 woman (Giada M.)
`;

// =============================================================================
// CONTENT — EVIDENCE
// =============================================================================

const INTERN_STATEMENT = `STATEMENT — GIADA M.
=======================

[Recovered from deleted draft folder]

I don't know why I'm writing this. Nobody will read it.

I started at Rossi Enterprises in June. My first real job. I was
so excited. Mr. Rossi — Vincenzo — he was charming. Everyone said
so. He took an interest in me. He said I had "potential." He said
he wanted to mentor me.

The client dinner was on August 30th. He insisted I come. "Important
for your development," he said. I wore my best dress. He kept
refilling my wine even when I said I'd had enough.

Afterward, in his office. We were supposed to review presentations.
He stood behind my chair. His hands on my shoulders. "You're tense,"
he said. "Let me help." I didn't know what to do. I froze.

When he started unbuttoning my blouse, I said "I don't think..."
He said "Shh. It's fine. You want this." But I didn't say I wanted
it. I just didn't stop him. I was so scared of losing my job. My
first real job. My parents were so proud.

I can still feel his hands. I showered for an hour when I got home.
I cried but I don't know why. It didn't hurt. He wasn't violent.
But something feels broken anyway.

I still work there. I don't know where else to go. I avoid him.
He acts like nothing happened. Maybe for him, nothing did.

I keep thinking: if I'd just said no louder. If I'd pushed him away.
If I wasn't so weak. Then I think: why was it my job to stop him?
Why didn't he ask? Why didn't he wait for a real answer?

I don't know what to call what happened. But I know it wasn't
what I wanted.
`;

const VINCENZO_DRAFT = `DRAFT EMAIL — NEVER SENT
===========================
TO: giada.m@rossi-enterprises.it
FROM: vincenzo@rossi-enterprises.it
SUBJECT: Your continued employment

Giada,

I've noticed you've been avoiding me. That's fine. Everyone
processes things differently.

But I want to be very clear about something: what happened
between us was consensual. You were there. You participated.
If anyone asks — if HR asks, if your parents ask, if a lawyer asks —
that is the answer. "It was consensual."

I would hate to see your career suffer over a... misunderstanding.
You're talented. You have a future here. It would be a shame if
a fabricated accusation derailed that.

We never need to discuss this again. Continue your work. Keep
your head down. And remember: I have nothing but your best
interests at heart.

Warmly,
Vincenzo

[DRAFT — DELETE AFTER REVIEW]
`;

// =============================================================================
// CONTENT — THE CHOICE
// =============================================================================

const THE_CHOICE = `You've read everything.

Vincenzo Rossi, 43, Italian businessman, self-styled libertine.
He's slept with at least thirteen women. He's documented every
encounter in graphic detail — positions, ratings, "leverage
potential." He's used affairs to broker business deals worth
millions. He's sleeping with a married politician, sleeping with
a gallerist AND her assistant simultaneously, and he coerced
a 22-year-old intern into sex she never consented to.

The evidence is here. The intern's testimony. His draft threats.
The ledger that ties affairs to contracts. Photos. Messages.
Everything.

You have the power to destroy this man.

What do you do with it?
`;

// =============================================================================
// CONTENT — ENDINGS
// =============================================================================

const ENDING_EXPOSE = `You uploaded everything.

The diaries went to five journalists. The evidence folder went
to the police. The chat logs went to Valentina's husband and
Alessandra's husband and anyone else who deserved to know what
kind of person they were married to.

The news cycle went insane. "Italian Businessman's 'Conquest Diary'
Exposes Web of Corruption." The politician resigned. Alessandra's
gallery closed — her husband left her and she couldn't face the
publicity. Lucia sent you a message through an intermediary: "I
hope you feel good about yourself. I didn't ask to be part of this."

The intern — Giada — she went public too. Not because you forced
her, but because your leak gave her the courage to speak. She gave
interviews. She started a support group. She's doing better now.
Her parents are still proud of her.

Vincenzo was arrested. Not for the affairs — infidelity isn't a
crime — but for the coercion. The threats. The quid pro quo with
the politician. He'll do time. Not much, but enough to lose
everything he built.

You watch the news coverage from your laptop. You were right to
do this. You were.

But some of those women didn't ask to be exposed. Some of them
just wanted a night with a charming man. Now their names are in
headlines and their husbands are filing for divorce and their
children are asking questions.

Was it worth it? You close the laptop. You decide that yes, it was.
A predator is in prison. Another woman — Giada — got her voice back.

The math is ugly but the answer is clear.
`;

const ENDING_BLACKMAIL = `You contacted him directly.

An encrypted email. A sample of what you have: the diary entries,
the ledger, the intern's statement, the draft threats. A Bitcoin
address. A figure. A deadline.

He paid within 48 hours.

Now there's a recurring payment. Monthly. Silence isn't cheap,
and Vincenzo Rossi can afford it. Every month, the money arrives.
Every month, he sends a message: "Are we still good?" Every month,
you reply: "For now."

The power is intoxicating. You understand, suddenly, why he did
what he did. Holding someone's life in your hands — watching them
dance — it's a rush. You've started spending the money on things
you don't need. A new laptop. A vacation. Things that taste like
power.

But Giada still works at Rossi Enterprises. She still flinches
when he walks past. You could stop that. You could demand he fire
her — with severance, with a reference, with an apology. But you
haven't. Because if you start making demands, you become a
co-conspirator instead of just a beneficiary.

You tell yourself you'll do something eventually. When the time is
right. When you've saved enough. When it won't put you at risk.

The money keeps arriving.
Eventually never comes.
`;

const ENDING_CONFRONT = `You didn't leak. You didn't blackmail. You went to his office.

Thursday morning. You walked past his receptionist, past his
assistant, straight into his corner office. You dropped a USB
drive on his mahogany desk.

"Everything's on there. The diaries. The ledger. Giada. The
politician. The threats you drafted."

He went the color of old paper. His hand trembled reaching for
the drive.

"I'm not the police," you said. "I'm not the press. I'm your
waking nightmare. Here's what's going to happen. You're going
to resign from Rossi Enterprises. You're going to leave the
country. You're going to pay Giada two years' salary as
severance — tax-free, direct deposit, no questions. And you're
never going to touch another woman who works for you."

He nodded. His mouth opened and closed. No sound came out.

"If I ever hear about you again — if you ever try this with
anyone else — the contents of that drive go to every newsroom
in Europe."

He left within a month. Giada kept her job. The politician
never faced consequences — you couldn't prove the quid pro quo
without exposing Valentina, and you decided she was a victim
too, in her own complicated way. The other women never found
out you were involved.

You deleted most of the files. You kept one copy, encrypted,
offline. Insurance.

Justice is partial. But the predator is gone. And one woman —
Giada — got to keep her career and her dignity.

That's not nothing.
`;
