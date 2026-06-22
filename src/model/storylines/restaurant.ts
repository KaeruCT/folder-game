// ── What We Owe Each Other ──

import kitchenSounds from "../../game-files/storylines/restaurant/audio/kitchen_sounds.mp3";
import restaurantAmbient from "../../game-files/storylines/restaurant/audio/restaurant_ambient.mp3";
import softJazz from "../../game-files/storylines/restaurant/audio/soft_jazz.mp3";
import busyRestaurantImg from "../../game-files/storylines/restaurant/images/busy_restaurant.jpg";
import emptyTablesImg from "../../game-files/storylines/restaurant/images/empty_tables.jpg";
import familyMealImg from "../../game-files/storylines/restaurant/images/family_meal.jpg";
import grandmaCookingImg from "../../game-files/storylines/restaurant/images/grandma_cooking.jpg";
import platedDishImg from "../../game-files/storylines/restaurant/images/plated_dish.jpg";
import restaurantInteriorImg from "../../game-files/storylines/restaurant/images/restaurant_interior.jpg";

import { createDirectoryStructure, type Directory } from "../files";
import type { Inventory } from "../inventory";
import type { Storyline } from "../storyline";

const storyline: Storyline = {
    id: "restaurant",
    name: "What We Owe Each Other",
    description:
        "Your father's restaurant is failing. The numbers don't add up. The regulars keep coming. Your grandmother's recipe is locked away. Something doesn't make sense — and you need to figure it out before the bank takes the keys.",

    buildFilesystem(): Directory {
        const rootDir = createDirectoryStructure("$ROOT");
        const root = rootDir.root;

        // ================================================================
        // README
        // ================================================================
        root.createFile("readme.txt", README, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Your father has run the restaurant for 22 years. The bank sent a final notice. You have two weeks to figure out where the money went.",
                );
                ctx.log("goal", "Start with the books. The POS records are in /pos. Something doesn't add up.");
            },
        });

        // ================================================================
        // POS — financial records
        // ================================================================
        const pos = root.createDirectory("pos");
        pos.createFile("restaurant_ambient.mp3", restaurantAmbient);
        pos.createFile("kitchen_sounds.mp3", kitchenSounds);
        pos.createFile("interior.jpg", restaurantInteriorImg);
        pos.createFile("busy_night.jpg", busyRestaurantImg);

        pos.createFile("daily_log.txt", DAILY_LOG, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Sales have been dropping for 18 months. Revenue is down 40%. The numbers are bad. But the food costs haven't dropped — he's still buying the same amount of ingredients.",
                );
                ctx.log("goal", "Check the voided orders. Something is off with the transaction log.");
            },
        });

        pos.createFile("voided.txt", VOIDED, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { office_key: 1 } });
                ctx.log(
                    "story",
                    "Hundreds of comped meals. Table 7, always Table 7. And a name that keeps appearing: Mrs. Chen. Tuesday at 1pm. Every week for three years. These aren't mistakes — they're a pattern.",
                );
                ctx.log("milestone", "The office is now accessible. Dad's personal records are in there.");
                ctx.log("goal", "Check the office. There might be an explanation.");
            },
        });

        pos.createFile("inventory.txt", INVENTORY, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Food costs haven't dropped with revenue. He's ordering the same amount of produce, same cuts of meat. Either he's terrible at inventory — or he's feeding more people than the till shows.",
                );
            },
        });

        // ================================================================
        // OFFICE — locked until voided orders are noticed
        // ================================================================
        const office = root.createDirectory("office", { key: "office_key" });
        office.createFile("empty_tables.jpg", emptyTablesImg);
        office.createFile("soft_jazz.mp3", softJazz);

        office.createFile("payroll.txt", PAYROLL, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Payroll is bare-bones. Two cooks, one dishwasher, one server. Dad hasn't taken a salary in eight months. He's been paying them out of savings.",
                );
                ctx.log("goal", "Check the emails folder. The customers might know something.");
            },
        });

        office.createFile("dad_calendar.txt", DAD_CALENDAR, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { calendar_clue: 1 } });
                ctx.log(
                    "story",
                    "His calendar is full of names, not appointments. Mrs. Chen Tuesdays. The Martinez kids on Fridays. Sarah and Lily on Wednesdays. These aren't vendors or suppliers. These are regulars.",
                );
            },
        });

        // Dad's journal — locked with password from grandma's letter
        office.createFile("dad_journal.txt", DAD_JOURNAL, {
            key: "journal_key",
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/grandma" });
                ctx.log(
                    "story",
                    "He knew the restaurant was dying. He chose it. Every meal he gave away, every comped check — he understood the cost. He did it anyway. A hidden folder has appeared.",
                );
                ctx.log("goal", "Open the grandma folder. This goes back further than you think.");
            },
        });

        // ================================================================
        // EMAILS
        // ================================================================
        const emails = root.createDirectory("emails");

        emails.createFile("mrs_chen.txt", EMAIL_MRS_CHEN, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { customer_clue: 1 } });
                ctx.log(
                    "story",
                    "Mrs. Chen, 74. Widow. Lives alone on a fixed income. Comes every Tuesday at 1pm. She's never paid — not once in three years. 'Your father told me the first meal was on the house. He's been saying that every Tuesday since.'",
                );
                ctx.log("goal", "Read the other emails. There are more regulars.");
            },
        });

        emails.createFile("martinez.txt", EMAIL_MARTINEZ, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "The Martinez family — five kids. Mr. Martinez lost his job last year. They come Fridays after the kids' soccer practice. Dad always has a table ready. The bill always comes to zero.",
                );
            },
        });

        emails.createFile("sarah.txt", EMAIL_SARAH, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Sarah, single mother. Waitress at the diner across town. Comes Wednesdays with her daughter Lily. 'He always puts a little extra in the takeout box. Lily thinks it's magic. I know it's your father.'",
                );
            },
        });

        emails.createFile("vendor_notice.txt", VENDOR_NOTICE, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "The meat supplier is threatening to cut him off. Three months behind. He's been paying them last, prioritizing payroll, prioritizing food. Prioritizing everyone except himself.",
                );
            },
        });

        // ================================================================
        // REGULARS — locked, password from cross-referencing
        // ================================================================
        const regulars = root.createDirectory("regulars", {
            key: "customer_clue",
        });
        regulars.createFile("family_meal.jpg", familyMealImg);

        regulars.createFile("mrs_chen_photo.txt", REG_MRS_CHEN, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "A photo of Mrs. Chen at her usual table. On the back, in Dad's handwriting: 'Her husband used to bring her here. Now she comes alone. I keep his seat empty. She doesn't know I notice.'",
                );
            },
        });

        regulars.createFile("the_martinez_kids.txt", REG_MARTINEZ, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "The five Martinez kids at Table 12. Dad's note: 'They share three portions between five of them. I've started making the portions bigger. They haven't noticed. Or maybe they have and they're too polite to say.'",
                );
            },
        });

        regulars.createFile("lilys_drawing.txt", REG_LILY, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { journal_key: 1 } });
                ctx.log(
                    "story",
                    "A crayon drawing from Lily, Sarah's daughter. A stick figure family at a table. Underneath: 'Thank you for the magic food.' Dad kept it pinned to his office wall. A journal key was folded inside.",
                );
                ctx.log("milestone", "Lily's drawing held a key. The journal is now accessible.");
                ctx.log("goal", "Open Dad's journal in the office. He wrote down what he couldn't say.");
            },
        });

        // ================================================================
        // GRANDMA — hidden, revealed by dad's journal
        // ================================================================
        const grandma = root.createDirectory("grandma", { hidden: true });
        grandma.createFile("grandma_cooking.jpg", grandmaCookingImg);
        grandma.createFile("plated_dish.jpg", platedDishImg);

        grandma.createFile("her_letter.txt", GRANDMA_LETTER, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/resolve.txt" });
                ctx.log(
                    "story",
                    "1989. The recession. Grandma fed half the neighborhood for free. She almost lost the restaurant. She wrote: 'The bank can take the building. They can't take what we built here. What we built here is people.'",
                );
                ctx.log("milestone", "This is who your family is. resolve.txt has appeared at the root.");
                ctx.log("goal", "Open resolve.txt. You know everything now.");
            },
        });

        // ================================================================
        // RECIPE — executable
        // ================================================================
        root.createFile("recipe.txt", "", {
            run(log, _ctx) {
                const times = (this.runState.timesRun ?? 0) + 1;
                this.runState.timesRun = times;

                if (times <= 1) {
                    log("GRANDMA'S RECIPE — DECODING...");
                    log("================================");
                    log("");
                    log("One whole chicken, cut into eight pieces.");
                    log("Four cloves of garlic. No, six. Always more garlic.");
                    log("One onion, diced. Cry into it. She said that improves the flavor.");
                    log("Three tablespoons of paprika — the smoked kind, from the tin");
                    log("  she brought from Hungary in 1956.");
                    log("Salt. Pepper. A bay leaf. Time.");
                    log("");
                    log("Instructions: Brown the chicken. Add everything else.");
                    log("Simmer for two hours. Serve to whoever walks through the door.");
                    log("");
                    log("Grandma's note: 'The recipe isn't finished until someone eats it.");
                    log("A dish with no one to feed is just ingredients. Remember that.'");
                    log("");
                    log("Decode complete.");
                } else {
                    log("RECIPE ALREADY DECODED.");
                    log("Grandma's note: 'The recipe isn't finished until someone eats it.'");
                }
            },
            runState: { timesRun: 0 },
        });

        // ================================================================
        // RESOLVE — hidden, revealed by grandma's letter
        // ================================================================
        root.createFile("resolve.txt", RESOLVE, {
            hidden: true,
            choices: [
                {
                    label: "Let the restaurant go. Some things can't be saved. The people will remember.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_letgo.txt" },
                },
                {
                    label: "Find a way to keep it open. Your family has been feeding people who need it for forty years. That's worth saving.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_keep.txt" },
                },
            ],
        });

        root.createFile("ending_letgo.txt", ENDING_LETGO, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to let it go.");
                ctx.log("story", ENDING_LETGO);
            },
        });
        root.createFile("ending_keep.txt", ENDING_KEEP, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to keep it open.");
                ctx.log("story", ENDING_KEEP);
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
                text: "The bank sent a final notice. The restaurant your grandmother opened in 1978, that your father has run for 22 years, will close in two weeks unless you can figure out where the money went.",
            },
            {
                id: `log-${now}-1`,
                timestamp: now,
                category: "goal" as const,
                text: "Start with the books. The POS records are in /pos. Something doesn't add up.",
            },
        ];
    },
};

export default storyline;

// ==========================================================================
// README
// ==========================================================================
const README = `Dad's laptop. He left it on the desk in the back office, next to a
cold cup of coffee and a stack of unpaid invoices.

The bank wants the keys in two weeks. The numbers don't make sense.
Revenue is down 40% but food costs haven't budged. Either he's the
worst businessman in the county, or something else is going on.

Start with the books. /pos has the transaction logs.

— M`;

// ==========================================================================
// DAILY LOG
// ==========================================================================
const DAILY_LOG = `===========================================
POS DAILY LOG — LAST 90 DAYS
===========================================

DATE        | COVERS | REVENUE  | AVG CHECK
------------|--------|----------|----------
Mar 15 Tue  |    42  |  $842.50 |  $20.06
Mar 16 Wed  |    38  |  $791.30 |  $20.82
Mar 17 Thu  |    51  | $1,102.00|  $21.61
Mar 18 Fri  |    67  | $1,440.50|  $21.50
Mar 19 Sat  |    82  | $1,845.00|  $22.50
Mar 22 Tue  |    40  |  $780.20 |  $19.51
Mar 23 Wed  |    37  |  $754.00 |  $20.38
...
Jun 14 Tue  |    41  |  $792.00 |  $19.32
Jun 15 Wed  |    36  |  $710.50 |  $19.74
Jun 17 Fri  |    63  | $1,260.00|  $20.00

COVERS = total guests served
AVG CHECK declining — same number of guests, lower bills.

Something is compressing the average without reducing covers.`;

// ==========================================================================
// VOIDED ORDERS
// ==========================================================================
const VOIDED = `===========================================
VOIDED / COMPED TRANSACTIONS — LAST 90 DAYS
===========================================

DATE        | TIME  | TABLE | AMOUNT  | REASON
------------|-------|-------|---------|------------------
Mar 15 Tue  | 13:02 |     7 |  $18.50 | Manager Comp
Mar 22 Tue  | 13:04 |     7 |  $19.00 | Manager Comp
Mar 29 Tue  | 12:58 |     7 |  $17.75 | Manager Comp
Apr 05 Tue  | 13:01 |     7 |  $20.25 | Manager Comp
Apr 08 Fri  | 18:15 |    12 |  $64.50 | Manager Comp
Apr 12 Tue  | 13:03 |     7 |  $18.00 | Manager Comp
Apr 15 Fri  | 18:10 |    12 |  $62.00 | Manager Comp
Apr 19 Tue  | 12:59 |     7 |  $19.50 | Manager Comp
Apr 20 Wed  | 18:30 |     4 |  $14.75 | Manager Comp
Apr 22 Fri  | 18:12 |    12 |  $66.00 | Manager Comp
Apr 26 Tue  | 13:00 |     7 |  $18.75 | Manager Comp
Apr 27 Wed  | 18:32 |     4 |  $15.50 | Manager Comp
...
Jun 07 Tue  | 13:01 |     7 |  $19.25 | Manager Comp
Jun 14 Tue  | 12:59 |     7 |  $18.50 | Manager Comp
Jun 15 Wed  | 18:28 |     4 |  $16.00 | Manager Comp
Jun 17 Fri  | 18:13 |    12 |  $67.50 | Manager Comp

TOTAL COMPED: $4,287.25 (90 days)
Table 7: 14 occurrences, always Tuesday, always ~1pm. Always alone.
Table 12: 13 occurrences, always Friday evening. Large orders.
Table 4: 14 occurrences, always Wednesday evening. Small orders.

Pattern consistent. These aren't mistakes.`;

// ==========================================================================
// INVENTORY
// ==========================================================================
const INVENTORY = `===========================================
INVENTORY & FOOD COST — LAST 6 MONTHS
===========================================

MONTH     | FOOD COST | REVENUE  | COST %
----------|-----------|----------|-------
January   |  $8,420   | $22,100  |  38.1%
February  |  $8,350   | $21,400  |  39.0%
March     |  $8,510   | $19,800  |  43.0%
April     |  $8,390   | $18,200  |  46.1%
May       |  $8,440   | $17,100  |  49.4%
June      |  $8,410   | $16,300  |  51.6%

Food cost is flat. Revenue is dropping. He's buying the same amount
of food and selling less of it. The math doesn't work — unless he's
giving it away.

Note: Industry standard is 28-35% food cost. We're at 51.6%.
The restaurant is hemorrhaging money on ingredients alone.`;

// ==========================================================================
// PAYROLL
// ==========================================================================
const PAYROLL = `===========================================
PAYROLL REGISTER — CURRENT
===========================================

NAME           | ROLE        | WEEKLY  | NOTES
---------------|-------------|---------|------------------
Maria Flores   | Head Cook   |  $720   | 14 years. Refused raise last year.
Carlos Reyes   | Line Cook   |  $580   | 6 years. Maria's nephew.
Elena Ivanova  | Dishwasher  |  $440   | 3 years. Sends money to family in Kyiv.
Jamal Brooks   | Server      |  $380   | +tips. 8 years. Knows every regular's order.

OWNER (Daniel Park): No salary — last withdrawal: August 2022 (8 months ago)

TOTAL WEEKLY PAYROLL: $2,120
Paid from personal savings account #4729 since October.
Savings balance as of March 15: $4,310.44`;

// ==========================================================================
// DAD'S CALENDAR
// ==========================================================================
const DAD_CALENDAR = `[Desk calendar — handwritten notes]

TUESDAYS:
"Mrs. Chen — 1pm — chicken paprikash — extra bread — don't let her see the check"

WEDNESDAYS:
"Sarah — 6:30pm — Lily likes the dumplings — put a cookie in the takeout box"

FRIDAYS:
"Martinez family — 6pm — table 12 — big portions — don't charge — they won't ask but they need it"

MARCH 15:
"Bank called again. Told them I'd figure it out. I won't."

APRIL 3:
"Carlos asked if we're closing. I told him we're fine. He didn't believe me."

MAY 22:
"Lily drew me a picture. A family at a table. She wrote 'magic food.'
I put it on the wall. Some things are worth more than a balanced ledger."`;

// ==========================================================================
// EMAILS
// ==========================================================================
const EMAIL_MRS_CHEN = `FROM: margaret.chen@email.com
TO: daniel@parksrestaurant.com
DATE: March 20

Daniel,

I know you've been comping my meals. You think I don't notice,
but I was married for 47 years — I know when a man is being kind
and pretending he isn't.

After Henry passed, I couldn't face an empty kitchen. Your
restaurant was the first place I went. You sat me at Table 7
and said "the chicken paprikash is good today." It was. It
reminded me of Henry's cooking. He was Hungarian too.

I don't have much, Daniel. But I have enough to pay for my meals.
Please let me. You can't keep giving away what you need to survive.

With gratitude,
Margaret Chen`;

const EMAIL_MARTINEZ = `FROM: rosa.martinez@email.com
TO: daniel@parksrestaurant.com
DATE: April 8

Mr. Park,

I know the meals are comped. Frankie — he's eight — he saw you
delete the charge on the register last Friday.

Jorge lost his job at the plant in November. We've been scraping
by. Friday dinners here are the one thing the kids look forward
to. The one normal thing. I don't know how to thank you for that.

When things turn around — and they will — we're going to pay you
back for every meal. I'm keeping track. $64.50 on April 8th.
I won't forget.

Rosa Martinez`;

const EMAIL_SARAH = `FROM: sarah.keane@email.com
TO: daniel@parksrestaurant.com
DATE: March 28

Daniel,

I saw you put the extra dumplings in the takeout box last night.
Lily calls it "magic food." She asked me if you were a wizard.
I told her yes.

I'm working double shifts at the diner this month. Money's tight.
You know how it is. But every Wednesday, Lily and I get to sit
at Table 4 and pretend everything's normal for an hour. That
hour is worth more than you know.

You should charge us. I'd find a way to pay. But I'm grateful
you don't.

Sarah`;

const VENDOR_NOTICE = `FROM: accounts@premiummeatsupply.com
TO: daniel@parksrestaurant.com
DATE: June 10
SUBJECT: FINAL NOTICE — ACCOUNT #4429

Mr. Park,

Your account is now 94 days past due. Outstanding balance: $4,830.

We have supplied your restaurant for 19 years. We value your
business. But we cannot continue to extend credit indefinitely.

Payment of at least $2,000 must be received by June 24 or we
will be forced to suspend deliveries.

We understand times are difficult. Please call us to discuss
a payment arrangement.

— Premium Meat Supply, Accounts Receivable`;

// ==========================================================================
// REGULARS
// ==========================================================================
const REG_MRS_CHEN = `[Photo: An elderly woman at Table 7, smiling. She's holding a
cup of coffee with both hands. The table has a single place setting.
The chair across from her is empty.]

Back of photo, in Dad's handwriting:

"Margaret Chen. 74 years old. Husband Henry passed March 2019.
They ate here every Sunday for 31 years. Same table. Same order.
Chicken paprikash, extra bread, coffee with two sugars.

She comes alone now. Every Tuesday. Same table. Same order.

I keep the chair across from her empty. I don't set it. She's
never asked why. I think she knows."`;

const REG_MARTINEZ = `[Photo: A large table crowded with plates and five kids of
varying ages. A man and woman sit at the ends, looking tired
but smiling.]

Back of photo, in Dad's handwriting:

"The Martinez family. Jorge, Rosa, and their five kids. Jorge
worked at the auto plant for 16 years before it closed. He's
been doing day labor while Rosa cleans houses.

They come every Friday. The kids share three plates between them.
I've been making the portions larger. The oldest — Sofia, she's 14 —
she noticed. She came up to the counter last week and said 'thank
you' so quietly I almost didn't hear her.

I told her it was a promotion. Kids eat free on Fridays.
She didn't believe me. She smiled anyway."`;

const REG_LILY = `[A crayon drawing on construction paper. Stick figures: a woman,
a small girl, and a tall man with glasses. They're sitting at a
table with plates. Above them, wobbly letters: "MAGIC FOOD"]

Back of drawing, in Sarah's handwriting:

"Daniel — Lily insisted I give this to you. She spent an hour on it.
The tall one is you. She says you make the food appear 'like magic'
because she's never seen a check at our table. I told her some
magic is better left unexplained.

Thank you. For everything.

— Sarah

P.S. — She's started asking if we can come twice a week. I told her
not to push her luck. She said 'Mr. Park doesn't mind.' She's right,
isn't she?"

[A small key was taped to the back of the drawing. It has a label:
"Office Journal."]`;

// ==========================================================================
// DAD'S JOURNAL
// ==========================================================================
const DAD_JOURNAL = `March 1

The bank called again. Third time this month. I told Maria we
might have to let Carlos go. She looked at me like I'd suggested
burning the place down. I dropped it.

I can't fire Carlos. His aunt raised him after his parents died.
This kitchen is his home. I can't take that from him.


March 15

Mrs. Chen came today. Chicken paprikash, extra bread. She told
me her husband used to make it. "Yours is better," she said. "Don't
tell Henry I said that."

She's 74. She lives alone. She gets $1,200 a month from Social
Security. Her rent is $900. I did the math. She has $10 a day
for everything else. I'm not taking that ten dollars.


April 22

The Martinez kids were hyper tonight. Sofia told me she got an A
on her history paper. I gave her a free dessert. She said I didn't
have to. I said it was a reward for good grades.

The bill should have been $67.50. I voided it. Rosa will
insist on paying someday. I'll tell her the card machine is
broken. Same excuse I've used for six months.


May 30

I went through grandma's old things today. Found her letter from
'89. She wrote: "The bank can take the building. They can't take
what we built. What we built is people."

She almost lost the restaurant during the recession. The whole
neighborhood was out of work. She fed them anyway. Three meals
a day, pay what you can. The ledger from that year is full of
zeros.

I guess it runs in the family.


June 5

I know what's coming. The numbers don't lie. By August, the
savings will be gone. By September, the suppliers will stop
delivering. By October, the bank will have the keys.

I've made peace with it. Mom — grandma — she would understand.
She'd probably be proud. She always said the restaurant wasn't
a business. It was a promise.

The promise was: if you're hungry, come in. We'll figure out
the money later.

There's no "later" left. But the promise still stands.`;

// ==========================================================================
// GRANDMA'S LETTER
// ==========================================================================
const GRANDMA_LETTER = `February 14, 1989

To whoever runs this place after me:

The recession is eating this neighborhood alive. The Johnson
family down the street — both parents laid off. Old Mr. Kowalski —
his pension got cut. The Washington kids — five of them, single
mom, you've seen them in the park.

I've been feeding them. All of them. No charge. Two months now.

The bank is furious. The accountant says I'm insane. My own
sister told me I'm running a charity, not a business. She's right.

But here's what I know: food is not a transaction. It's a promise.
When you put a plate in front of someone, you're saying: I see you.
You matter. You deserve to eat something that was made with care.

The bank can take the building. They can't take what we built here.
What we built here is people. It's Margaret Chen, who came here
on her first date with Henry in 1962 and has come every Sunday since.
It's the Martinez kids, who learned to walk holding onto our table legs.
It's every person who ever walked through that door hungry and left
feeling like they belonged somewhere.

Keep feeding people. Whatever it costs. The ledger doesn't
measure what matters.

With love,
Soon-ja Park`;

// ==========================================================================
// RESOLVE
// ==========================================================================
const RESOLVE = `You've read everything.

Your father has been running the restaurant at a loss for over a
year — not because he's bad at business, but because he's been
feeding people who can't afford to pay. Mrs. Chen. The Martinez
family. Sarah and Lily. And others you probably haven't found yet.

Your grandmother did the same thing in 1989. She almost lost the
restaurant then too. She wrote: "The ledger doesn't measure what
matters."

The bank wants the keys in two weeks. The savings are gone. The
suppliers are threatening to cut him off. The numbers don't work.

But the regulars keep coming. The kitchen keeps cooking. Your
father keeps comping the checks.

Your family has been feeding this neighborhood for forty-five years.
Maybe that's worth more than a balanced ledger. Maybe it's not.

What do you do?`;

// ==========================================================================
// ENDINGS
// ==========================================================================
const ENDING_LETGO = `You let the bank take the keys.

The last night, you and Dad cooked together — chicken paprikash,
the way Grandma taught him. You invited Mrs. Chen. The Martinez
family came. Sarah and Lily brought flowers.

Forty-five people showed up. Some of them you recognized. Most
you didn't. Every single one had a story about your grandmother,
or your father, or a meal that arrived at exactly the right moment.

Mrs. Chen stood up and gave a speech. She said: "This restaurant
fed me when I was hungry. It kept me company when I was alone.
It reminded me that I still mattered to someone. You can't put
that on a balance sheet."

The building belongs to the bank now. But the restaurant —
the real one, the one your grandmother built and your father
protected — that belongs to everyone who ever ate here.

Some things aren't measured in dollars. Some things just are.`;

const ENDING_KEEP = `You found a way.

You started a community fund. Posted the story online. Mrs. Chen's
speech about Henry went viral — 47 years of Sunday dinners at the
same table. People started donating. The Martinez kids made a video.
Lily drew another picture, this one with the whole restaurant in it.

A local news station came. Then a national one. The story wasn't
about a failing restaurant. It was about a family that spent forty-five
years feeding people who needed it, no questions asked, no strings
attached.

The fund raised $87,000 in three weeks. Enough to pay the suppliers,
catch up on rent, and keep the doors open for another year. More
than enough.

Dad cried when you told him. He said Grandma would have laughed.
"She always said the neighborhood would take care of us," he said.
"She was right. She was always right."

The restaurant is still open. Table 7 is still reserved on Tuesdays.
The Martinez kids still come on Fridays. Lily still believes in
magic food.

Some things are worth saving. Some people are worth feeding.
Your family proved both.`;
