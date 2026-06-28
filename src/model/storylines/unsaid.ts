// ── The Things We Don't Say ──
// Images
import classroomImg from "../../game-files/storylines/unsaid/images/daniel_classroom.jpg";
import elenaImg from "../../game-files/storylines/unsaid/images/elena_garden.jpg";
import emptyClassroomImg from "../../game-files/storylines/unsaid/images/empty_classroom.jpg";
import graduationImg from "../../game-files/storylines/unsaid/images/graduation.jpg";
import letterImg from "../../game-files/storylines/unsaid/images/handwritten_letter.jpg";
import hallwayImg from "../../game-files/storylines/unsaid/images/school_hallway.jpg";

import { createDirectoryStructure, type Directory } from "../files";
import type { Inventory } from "../inventory";
import type { Storyline } from "../storyline";

const storyline: Storyline = {
    id: "unsaid",
    name: "The Things We Don't Say",
    description:
        "Your father passed three weeks ago. His old laptop holds a truth you were never meant to find — about love, loss, and the silence between the people who know you best.",
    hook: "A father's old laptop turns grief into a mystery about love, silence, and what families hide.",
    playtime: "12–18 min",
    tags: ["emotional", "family", "memory"],

    buildFilesystem(): Directory {
        const rootDir = createDirectoryStructure("$ROOT");
        const root = rootDir.root;

        // ================================================================
        // README
        // ================================================================

        root.createFile("readme.txt", README, {
            startHere: true,
            onRead(ctx) {
                ctx.log(
                    "story",
                    "You found your father's laptop in his study, tucked behind a stack of graded essays. The screen is cracked at the corner. It still smells like coffee.",
                );
                ctx.log("goal", "Start in the classroom folder. That's where he spent his life.");
            },
        });

        // ================================================================
        // PHOTOS
        // ================================================================

        const photos = root.createDirectory("photos");
        photos.createFile("daniel_at_his_desk.jpg", classroomImg);
        photos.createFile("elena_in_the_garden.jpg", elenaImg);

        // ================================================================
        // CLASSROOM
        // ================================================================

        const classroom = root.createDirectory("classroom");
        classroom.createFile("school_hallway.jpg", hallwayImg);
        classroom.createFile("empty_classroom.jpg", emptyClassroomImg);

        classroom.createFile("syllabus.txt", SYLLABUS, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Daniel taught English at Westbrook High for twenty-seven years. His syllabus is methodical but warm — he annotated it with notes about specific students.",
                );
            },
        });

        classroom.createFile("favorite_poem.txt", FAVORITE_POEM, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { elena_password: 1 } });
                ctx.log(
                    "story",
                    "A poem called 'Late Returns' by a poet named Miriam Ashby. Daniel underlined the last stanza twice. A note in the margin reads: 'Elena was my late return. She was my poetry.'",
                );
                ctx.log("milestone", "The journal is locked. The password is hidden in what he loved most.");
                ctx.log("goal", "Use 'Elena' to unlock his journal.");
            },
        });

        // Letters to Maya — locked behind the poem's title
        const letters = classroom.createDirectory("letters", { key: "late_returns" });
        letters.createFile("to_maya_1.txt", LETTER_MAYA_1, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { late_returns: 1 } });
                ctx.log(
                    "story",
                    "Daniel's first letter to Maya Reyes, a student who stopped coming to class. He noticed. He always noticed.",
                );
                ctx.log("goal", "The rest of the letters are in this folder. Keep reading.");
            },
        });
        letters.createFile("to_maya_2.txt", LETTER_MAYA_2, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/classroom/letters/to_maya_3.txt" });
                ctx.log(
                    "story",
                    "Maya wrote back. She was in a dark place, and Daniel's words were the only thing that reached her. A hidden letter has appeared.",
                );
            },
        });
        letters.createFile("to_maya_3.txt", LETTER_MAYA_3, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/maya" });
                ctx.log(
                    "story",
                    "Daniel's final letter to Maya, months later. She graduated. She's okay. He saved a life. A folder about Maya has appeared at the root.",
                );
                ctx.log("goal", "Open the Maya folder to find out who she became.");
            },
        });

        // ================================================================
        // JOURNAL — locked with elena_password
        // ================================================================

        const journal = root.createDirectory("journal", { key: "elena_password" });
        journal.createFile("handwritten_letter.jpg", letterImg);

        journal.createFile("after_elena.txt", JOURNAL_AFTER_ELENA, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/elena" });
                ctx.dispatch({ type: "ADD_ITEMS", payload: { late_returns: 1 } });
                ctx.log(
                    "story",
                    "Eight years ago. Daniel sat in his empty house the night after Elena's funeral and wrote this. He didn't know how to be alone.",
                );
                ctx.log("milestone", "A hidden folder about Elena has appeared — her things, her words.");
                ctx.log("goal", "Open the Elena folder to meet the person your father never stopped loving.");
            },
        });

        journal.createFile("the_years_after.txt", JOURNAL_YEARS_AFTER, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/journal/the_news.txt" });
                ctx.log(
                    "story",
                    "Daniel learned to live without Elena — teaching, writing letters, finding small joys. But something was waiting for him. A hidden entry has surfaced.",
                );
                ctx.log("goal", "Read the hidden entry. Something changed for Daniel recently.");
            },
        });

        journal.createFile("the_news.txt", JOURNAL_THE_NEWS, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/journal/goodbye.txt" });
                ctx.log(
                    "story",
                    "Six months ago. The diagnosis. Daniel handled it the way he handled everything — quietly, privately, protecting everyone from the weight of it.",
                );
                ctx.log("milestone", "His final entry has been revealed.");
                ctx.log("goal", "Read Daniel's goodbye. He left it for someone.");
            },
        });

        journal.createFile("goodbye.txt", JOURNAL_GOODBYE, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/resolve.txt" });
                ctx.log(
                    "story",
                    "Daniel's last words. He made a choice — not out of despair, but out of love. He didn't want anyone to watch him fade. He wanted to leave on his own terms.",
                );
                ctx.log("milestone", "The truth is on the table. A file called resolve.txt has appeared at the root.");
                ctx.log("goal", "Open resolve.txt. You have a decision to make.");
            },
        });

        // ================================================================
        // ELENA — hidden, revealed by journal/after_elena
        // ================================================================

        const elena = root.createDirectory("elena", { hidden: true });
        elena.createFile("elena_in_the_garden.jpg", elenaImg);

        elena.createFile("her_last_letter.txt", ELENA_LETTER, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Elena wrote this letter to Daniel three days before she died. She told him to keep living, to find joy again, to not let grief become his whole identity.",
                );
                ctx.log("goal", "Elena wanted Daniel to be happy. Did he manage it? Return to his journal.");
            },
        });

        // ================================================================
        // MAYA — hidden, revealed by letter to maya 3
        // ================================================================

        const maya = root.createDirectory("maya", { hidden: true });
        maya.createFile("graduation.jpg", graduationImg);

        maya.createFile("her_reply_1.txt", MAYA_REPLY_1, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/maya/her_reply_2.txt" });
                ctx.log(
                    "story",
                    "Maya's reply to Daniel, five years later. She became a teacher. She credited him entirely. She asked if they could meet for coffee.",
                );
                ctx.log("goal", "There's more. A second reply has appeared.");
            },
        });

        maya.createFile("her_reply_2.txt", MAYA_REPLY_2, {
            hidden: true,
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Maya's second reply. She met Daniel for coffee. She met his family. She met YOU — intentionally. She knew who you were before you knew her name. She's been carrying this secret for five years.",
                );
                ctx.log(
                    "milestone",
                    "The person you've loved for five years met you because of your father. She knew him. She never told you.",
                );
                ctx.log("goal", "Find resolve.txt and decide what to do with this truth.");
            },
        });

        // ================================================================
        // THOMAS — Daniel's colleague
        // ================================================================

        const thomas = root.createDirectory("thomas");
        thomas.createFile("message_1.txt", THOMAS_1, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Thomas, Daniel's colleague of fifteen years. He knew Daniel was struggling but never pushed. 'That's how Daniel was,' he writes. 'You had to meet him where he stood.'",
                );
            },
        });
        thomas.createFile("message_2.txt", THOMAS_2, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Thomas's eulogy. He talks about Daniel's quiet dignity, the students who came back years later to thank him, the way he never raised his voice — and somehow commanded more respect than anyone who did.",
                );
            },
        });

        // ================================================================
        // RESOLVE — hidden, revealed by journal/goodbye.txt
        // ================================================================

        root.createFile("resolve.txt", RESOLVE, {
            hidden: true,
            choices: [
                {
                    label: "Keep it to yourself. Maya had her reasons. Some truths are too heavy to speak aloud.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_understanding.txt" },
                },
                {
                    label: "Talk to her. You need to hear it from her — not from a file, not from a ghost. From her.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_conversation.txt" },
                },
            ],
        });

        // Ending files
        root.createFile("ending_understanding.txt", ENDING_UNDERSTANDING, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to let the silence stand.");
                ctx.log("story", ENDING_UNDERSTANDING);
            },
        });
        root.createFile("ending_conversation.txt", ENDING_CONVERSATION, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to talk to her.");
                ctx.log("story", ENDING_CONVERSATION);
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
                text: "Your father, Daniel, died three weeks ago. You found his old laptop in his study. It still smells like coffee.",
            },
            {
                id: `log-${now}-1`,
                timestamp: now,
                category: "goal" as const,
                text: "Start in the classroom folder. That's where he spent his life.",
            },
        ];
    },
};

export default storyline;

// ==========================================================================
// README
// ==========================================================================

const README = `If you're reading this, I've cleaned out my desk for the last time.

The classroom folder has everything — lesson plans, poems I loved,
letters I wrote to students who were struggling. The journal is
locked. You'll figure out the password. You're smarter than me.

I'm sorry for the mess. I'm sorry for the silence. I'm sorry I
didn't tell you sooner.

Start with the classroom. That's where the good stuff is.

— Dad`;

// ==========================================================================
// SYLLABUS
// ==========================================================================

const SYLLABUS = `WESTBROOK HIGH SCHOOL — ENGLISH 11
Mr. Daniel Chen
Fall Semester 2023

COURSE DESCRIPTION:
This class is about learning to pay attention. To sentences, to
each other, to the small things that make a life meaningful.

TEXTS:
- To Kill a Mockingbird (Lee)
- The Great Gatsby (Fitzgerald)
- Selected poetry: Oliver, Ashby, Neruda, Limón
- Student-choice independent reading (one book per month)

GRADING:
Essays (40%), Participation (25%), Reading Journal (20%),
Final Project (15%)

OFFICE HOURS:
Tuesday/Thursday 3:15–4:30. Or whenever you need me.
The door is always open. That's not a metaphor.

A NOTE FROM MR. CHEN:
There are no bad questions. There are no stupid interpretations.
If a poem made you feel something, that's analysis enough.
We'll figure out the rest together.

[Handwritten in the margin:]
"Miriam Ashby's 'Late Returns' — read this one aloud. Let them
hear the rhythm before they see the words. Trust the silence
between stanzas. That's where the meaning lives."`;

// ==========================================================================
// FAVORITE POEM
// ==========================================================================

const FAVORITE_POEM = `LATE RETURNS
by Miriam Ashby

I brought the books back to the library today —
the ones you left on the nightstand,
spines cracked, pages folded at the corners
where you stopped to think.
Three years late. The librarian smiled.
She didn't charge me. She said
some things come back when they're ready.

I walked home the long way,
past the bakery where you always
stopped for cinnamon rolls,
past the bench where we sat
the first time you told me
you were afraid of dying young.
You were twenty-four. We laughed.
We were stupid. We were perfect.

The house still smells like you.
Not the perfume — the other thing.
The warmth. The quiet hum of you
reading in the armchair, your feet
tucked under my thigh. I haven't
moved the armchair. I haven't washed
the mug you used every morning.
It sits on the counter, a small
ceramic argument against forgetting.

I am learning that grief is not
a wave that passes. It is a room
you move into. You decorate it.
You learn where the floorboards creak.
Eventually you stop wanting to leave.

The librarian was wrong.
Some things don't come back.
But some things stay. Some things
refuse to be returned. You are
the book I will never stop reading.
You are the fine I will never pay.
You are my late return. My overdue.
My always. My still.

[Daniel's note in the margin:]
"For Elena. She was my late return.
She was my poetry."`;

// ==========================================================================
// LETTERS TO MAYA
// ==========================================================================

const LETTER_MAYA_1 = `Dear Maya,

You've missed six classes. Mrs. Kowalski in the front office
says you're sick, but I've been teaching for twenty-seven years
and I know what "sick" looks like when it's really something else.

I'm not going to lecture you about attendance. I'm not going
to call your parents. I just want you to know that I noticed
you were gone, and the classroom is worse without you in it.

Last month you wrote an essay about The Great Gatsby — the one
about the green light and how wanting something can be more
beautiful than having it. You wrote that Gatsby didn't love Daisy.
He loved the version of himself that existed before he lost her.
That's the most insightful thing anyone has written in my class
in five years. Maybe ten.

You have a mind that notices things other people miss. That's
a gift. It's also a burden. I know because I have it too.

If you want to talk, my door is open. If you want to just sit
in the back of the classroom and not say anything, that's fine
too. Just come back.

You matter, Maya. Not as a student. As a person.

— Mr. Chen`;

const LETTER_MAYA_2 = `Dear Maya,

You came back. You sat in the back corner and didn't say a word
for two weeks. That was enough. I was proud of you for just
showing up.

You asked me after class yesterday how I knew you were struggling.
I told you the truth: I've been where you are. Not the same
circumstances — everyone's darkness is their own — but the same
weight. The same feeling that the world is happening to other
people while you're stuck in a room with the door locked from
the inside.

When I was twenty-eight, my wife got sick. Elena. I watched her
disappear a little more each day for eleven months. I wanted to
disappear with her. Some days I almost did.

What kept me here was this: she made me promise. On her last good
day, when the pain medication was working and she could still
laugh, she held my hand and said, "Daniel. Don't you dare waste
the life I don't get to have."

So I didn't. I went back to teaching. I paid attention to the
students who were slipping away. I tried to be for them what
Elena had been for me — a reason to stay.

You are not a burden, Maya. You are not broken. You are a person
who is carrying something heavy, and you don't have to carry it
alone.

Come to class on Friday. I'll bring coffee. We can talk about
poetry. We can talk about nothing. Whatever you need.

— Mr. Chen`;

const LETTER_MAYA_3 = `Dear Maya,

You graduated. You walked across the stage in your blue gown and
I sat in the third row and cried. I'm not ashamed of that.

You wrote me a card afterward — the one tucked inside your
yearbook. You said I saved your life. I need you to understand
something: you saved your own life. I just reminded you that
it was worth saving.

You're going to college in the fall. You're going to study
education, you said. You want to be a teacher. You want to do
for other kids what I did for you.

I don't know how to tell you how much that means to me without
sounding like I'm giving a speech at a faculty meeting. So I'll
just say this: the best thing a teacher can hope for is that
their students become the kind of people who notice when someone
is missing. You already are that person. You were that person
before I ever met you.

Go be extraordinary, Maya. I'll be here if you ever need me.

With more pride than I can put into words,

— Daniel`;

// ==========================================================================
// JOURNAL
// ==========================================================================

const JOURNAL_AFTER_ELENA = `October 14, 2015

The funeral was yesterday. I wore the tie she bought me for
our tenth anniversary — the blue one with the small yellow
dots that she said made me look "like a man who reads."

The house is too quiet. I keep waiting for her to walk through
the door with grocery bags and a story about a stranger she
met in the produce section. Elena could make friends with
anyone. She once had a twenty-minute conversation with a
toll booth operator. We were late to dinner. She didn't care.

I don't know how to do this. I don't know how to be a person
without her. We met when we were nineteen. I have never been
an adult without Elena in my life. I don't know who I am
without her reflection.

Thomas came by with a casserole. He sat with me for an hour
and didn't say much. That was good. I didn't need words. I
just needed someone in the room.

The students don't know yet. I'm taking two weeks off and then
I'll go back. I don't know how I'll stand in front of a
classroom and talk about Gatsby's green light when all I can
think about is the way Elena's hand felt in mine at the end.

She made me promise to keep living. I promised. I don't know
if I meant it.`;

const JOURNAL_YEARS_AFTER = `March 3, 2020

Five years without her. Some days I forget she's gone — I'll
reach for my phone to text her something funny a student said,
and then I remember. The remembering never gets easier. It just
gets more familiar.

Teaching saved me. I know that now. The students gave me
something to focus on that wasn't my own grief. Maya Reyes
graduated last year. She sent me a photo of her first classroom.
She's teaching eighth grade English in Portland. She has a
Post-it note on her desk that says "What would Mr. Chen do?"

I cried when I saw that. Happy tears. The kind Elena would
have teased me about.

I still miss her. I will always miss her. But I've learned to
carry the missing. It's like the poem says — grief is a room
you move into. I've decorated mine. There are photos of Elena
on every wall. There's always fresh coffee. The armchair is
still in the same spot.

I think I'm okay. I think she'd be proud of me.

I hope she'd be proud of me.`;

const JOURNAL_THE_NEWS = `January 17, 2023

The doctor called this morning. Pancreatic. Advanced. He used
words like "months" and "comfortable" and "quality of life."
I nodded and thanked him and drove home and sat in the driveway
for forty minutes before I could make myself go inside.

I'm not afraid of dying. I've been ready to see Elena again
since the day I lost her. What I'm afraid of is the in-between.
The hospital beds and the plastic tubes and the people I love
watching me disappear the way I watched Elena disappear.

I don't want that for them. I don't want my last months to be
a slow erasure. I want to leave while I'm still myself.

I haven't told anyone. Not yet. Maybe not ever.

There's a way to do this. There's a place in Oregon — they
call it "death with dignity." It's legal there. Maya lives
there. Maybe she can help me figure this out.

I'm going to write to her.`;

const JOURNAL_GOODBYE = `April 2, 2023

I made the arrangements. Maya helped — she knows people,
she said. A clinic, a doctor, a date. It's strange to have
a date. Most people don't get to choose theirs. In a way,
I'm lucky.

I spent today in the garden. The daffodils Elena planted
fifteen years ago are still coming up. Every spring, without
fail. She'd like that. She'd say, "See? I told you those
bulbs would take."

I've been thinking about what to write here. What I want to
leave behind. Not instructions — I've left those with Thomas.
Not apologies — I've said my sorries where they were needed.
Just... this. A record. A voice.

To whoever finds this:

I was a teacher. I loved a woman named Elena with my whole
heart for thirty-one years. I helped a girl named Maya when
she needed someone to notice she was disappearing. I read
poetry out loud to seventeen-year-olds who pretended to be
bored but weren't. I drank too much coffee and I graded too
many essays and I laughed at my own jokes in an empty classroom.

It was a good life. It was enough.

If there's an afterlife, I hope it's a library with Elena
in the armchair, a stack of books between us, and all the time
in the world to read them.

If there isn't — well. This was enough. She was enough.

Goodbye.

— Daniel`;

// ==========================================================================
// ELENA'S LETTER
// ==========================================================================

const ELENA_LETTER = `My Daniel,

If you're reading this, I'm gone. I'm sorry. I tried to stay.

I need you to do something for me. Actually, several things:

One. Eat breakfast. You always skip it when you're sad.

Two. Go back to teaching. Those kids need you. You need them.
Don't hide in this house and let the silence eat you alive.

Three. Let yourself be happy again. I know it feels impossible
right now. I know it feels like a betrayal. It's not. I want
you to find joy. I want you to laugh at dumb jokes and read
good books and maybe even love someone again. Not to replace
me — that's not possible. But to remind you that you're still
alive, and being alive means letting new things in.

Four. Remember me. Not the sick me — the me in the garden, with
dirt on my hands and sun on my face. The me who danced with you
in the kitchen to that awful radio station. The me who loved you
from the moment you spilled coffee on my sweater at the campus
library and looked like you wanted the floor to swallow you.

You made me so happy, Daniel. Every single day, even the hard
ones. Especially the hard ones.

Don't you dare waste the life I don't get to have.

I love you. I have always loved you. I will always love you.

— Elena`;

// ==========================================================================
// MAYA'S REPLIES
// ==========================================================================

const MAYA_REPLY_1 = `Dear Mr. Chen — Daniel,

I don't know if you remember me. It's been a while.

I'm a teacher now. Eighth grade English in Portland. I have
my own classroom and my own students and my own stack of
essays to grade on Sunday nights while I drink too much coffee.
I even have a Post-it note on my desk that says "What would
Mr. Chen do?" My students think it's funny. I think it's the
most honest thing I've ever written.

I want you to know that I'm okay. I'm more than okay. I'm
happy. I have a partner I love and a cat who hates me and
a life that feels like it belongs to me now. None of that
would have happened without you.

You said I saved my own life. Maybe. But you were the first
person who made me think it was worth saving. That matters.
It matters more than I know how to say.

I'm going to be in town next month for a conference. Can I
buy you coffee? I'd like to thank you in person.

With more gratitude than I can express,

— Maya`;

const MAYA_REPLY_2 = `Daniel,

I need to be honest with you about something.

When we met for coffee last year, you introduced me to your
family. Your child. The one you've always talked about with
so much pride. And I recognized them. I'd met them before —
at a bookshop, three months earlier. We talked for an hour
about novels we both loved. They gave me their number.

I didn't tell them who I was. I didn't say I knew their father.
I didn't say that their father was the reason I was still alive.

I've been with them for five years now. We live together. We
have a cat. We're building a life.

They don't know about you. They don't know that I found them
because of you. They don't know that when I first saw them in
that bookshop, I already knew their name, their face, their
story — because you told me. Because you loved them so much
that your love spilled into every conversation we ever had.

I've been carrying this secret for five years. I don't know
if it's a betrayal or a gift. I don't know if you'd be angry
or proud. I just know that I love them. I love them more than
I've ever loved anyone. And I think — I hope — that you'd
understand.

You saved my life. And then, through you, I found the person
I want to spend the rest of it with.

Thank you. I'm sorry. I love you.

— Maya`;

// ==========================================================================
// THOMAS
// ==========================================================================

const THOMAS_1 = `FROM: thomas.graves@westbrook.edu
TO: daniel.chen@westbrook.edu
DATE: November 8, 2022

Daniel,

I noticed you've been leaving early the past few weeks. You
also skipped the department meeting on Tuesday — which, to be
fair, I wish I had skipped too. But it's not like you.

Everything okay? You know you can talk to me. Fifteen years of
sharing a hallway has to count for something.

Also, Mrs. Patel in the library says you still have a copy of
Beloved that you checked out in 2019. She's not mad. She's
impressed.

— Thomas`;

const THOMAS_2 = `EULOGY FOR DANIEL CHEN
Delivered by Thomas Graves, April 15, 2023

Daniel Chen taught English at Westbrook High for twenty-seven
years. If you add up all the students who passed through his
classroom, it's somewhere around four thousand. Four thousand
teenagers who read Gatsby and Mockingbird and Miriam Ashby
and learned that poetry isn't about finding the "right" answer —
it's about learning to sit with a question.

Daniel's classroom was the kind of place where you could be
wrong without being embarrassed. Where a kid who never spoke
in any other class might raise their hand. Where the quiet
ones were noticed and the loud ones were listened to and
everyone, everyone, was treated like they mattered.

Because to Daniel, they did.

He was a good teacher. He was a better man. He lost his wife
eight years ago and never stopped loving her. He carried his
grief quietly, the way he carried everything — with dignity,
with grace, with a cup of coffee that had gone cold an hour ago.

I'll miss him. We'll all miss him. But if you want to honor
him — really honor him — pay attention. Notice when someone
is missing. Ask if they're okay. Be the person who makes
someone feel seen.

That's what Daniel did. That's who Daniel was.

Rest easy, old friend. The classroom is emptier without you.`;

// ==========================================================================
// RESOLVE
// ==========================================================================

const RESOLVE = `You've read everything.

Your father was a teacher. He lost the love of his life and
kept going. He saved a student from herself. He was diagnosed
with a terminal illness and chose to leave on his own terms.

And the person you've loved for five years — Maya — met you
because of him. She knew your father. She knew who you were
before you knew her. She has kept this from you for your
entire relationship.

You could see this as a betrayal. A lie by omission. A secret
that makes you question everything you thought you knew about
the person sleeping next to you.

Or you could see it differently. Your father saved Maya's life.
She became a teacher because of him. She met you because of him.
In a way, he gave you to each other. The secret wasn't malice.
It was gratitude so profound that it was too heavy to speak.

What do you do?`;

// ==========================================================================
// ENDINGS
// ==========================================================================

const ENDING_UNDERSTANDING = `You close the laptop.

The house is quiet. Outside, the sun is setting — the same sun
that set on your father's garden, on Elena's daffodils, on the
classroom where Daniel spent twenty-seven years teaching
teenagers that poetry matters.

Maya is in the kitchen. You can hear her humming — some song
you don't recognize. She does that when she's cooking. She
doesn't know you've been reading your father's files. She
doesn't know you know.

You think about confronting her. About the five years of silence.
About the weight of a secret kept for so long.

But then you think about your father. About the way he carried
Elena's death for eight years and still found room to save Maya.
About the way he handled his diagnosis — privately, quietly,
protecting everyone from the pain of watching him disappear.

Some truths are too heavy to speak aloud. Some secrets are kept
not out of deception but out of a love so large it doesn't fit
into words.

Maya calls from the kitchen — dinner's ready. You stand up. You
walk into the kitchen. You look at her face — the face of someone
your father saved, the face of someone who loved him too, in her
own way. The face of someone who chose you, over and over, for
five years.

You don't say anything.

You sit down. You eat dinner. You let the silence hold what words
can't.

Some things come back when they're ready.

Some things never need to be said at all.`;

const ENDING_CONVERSATION = `You don't close the laptop. You carry it into the kitchen.

Maya is at the stove, stirring something. She turns when she
hears you. Her face changes when she sees yours — she knows
something is wrong. She's always been able to read you.

You set the laptop on the counter. You ask her to sit down.

It takes a long time. You tell her what you found. You tell her
about the journal, the letters, the poem in the margin, the
diagnosis, the goodbye. You tell her you know about the bookshop.
About the five years. About the secret.

She doesn't deny any of it. She cries — not the kind of crying
that asks for forgiveness, but the kind that comes from carrying
something for so long that the release itself is painful.

She tells you about your father. The real version — not the
teacher, not the mentor, but the man who sat across from her in
a coffee shop and talked about you for two hours, his eyes bright,
his voice full of a pride so fierce it made her want to meet you.
She tells you that she didn't plan to fall in love with you.
She tells you that by the time she realized she should tell you,
she was terrified of losing you.

You listen. You don't interrupt. You let her say everything she's
been holding in for five years.

When she's done, the kitchen is quiet. The food on the stove has
gone cold. Outside, the sun has set.

You reach across the table and take her hand.

You don't know if you can forgive the secret. But you know you
love her. You know your father loved her. You know that the three
of you — you, Maya, and Daniel — are connected in a way that is
too complicated to untangle and too precious to throw away.

"This is going to take time," you say.

She nods. She holds your hand tighter.

The silence between you isn't empty anymore. It's full of
everything you've finally said.`;
