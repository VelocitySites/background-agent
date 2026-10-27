import type { ClothingItem } from "@/lib/shop/catalog";

export interface StoryLayer {
  id: "material" | "origin" | "supply" | "source";
  label: string;
  title: string;
  body: string;
}

/**
 * Four depths for every partner piece.
 * Material facts follow the product. Deeper layers describe the real path
 * that kind of goods takes. They are not a factory audit.
 */
const STORIES: Record<string, StoryLayer[]> = {
  h1: [
    {
      id: "material",
      label: "Material",
      title: "Washed cotton twill",
      body: "A Heritage86-style cap is cotton twill cut into crown panels and a brim, then washed so the cloth slumps instead of standing up. The eyelets and the button on top are there so the crown can breathe and the panels meet.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A boll, then a yarn",
      body: "Twill starts as cotton lint pulled off the seed. It is spun into yarn and woven with a diagonal rib, which is what lets a brim hold a curve without turning stiff. The wash is water, time, and chemistry on finished cloth.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Farm, mill, sewing floor",
      body: "Cotton is ginned near the field, spun and woven in a mill, then shipped as rolls to a headwear shop that cuts the panels, sews the crown, and sets the brim. Nike publishes factory lists that change by season. This cap is not pinned to one building.",
    },
    {
      id: "source",
      label: "Source",
      title: "The cotton field",
      body: "The first person in this hat is whoever picked or stripped the cotton. That work is hot, short, and paid by the season. Until a piece is ours, the bio stops at the crop: we can name the fiber, not yet the farm or the wage.",
    },
  ],
  h2: [
    {
      id: "material",
      label: "Material",
      title: "Acrylic knit",
      body: "Carhartt's watch hat is a rib-knit tube of acrylic with a folded cuff. Acrylic is a plastic fiber. It is warm when wet, cheap to knit, and it does not come from an animal or a plant.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A gas, turned into yarn",
      body: "Acrylic starts as acrylonitrile, made from propylene that comes out of oil or natural gas. The polymer is extruded into filaments, cut into staple, and spun like a wool yarn so a knitter can run it.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Cracker, spinner, knitter",
      body: "A chemical plant makes the polymer. A spinner turns it into yarn. A knitting room links the hat and the cuff. Carhartt sells it. There is no barn in this chain, and no public note on this page that names the knitter.",
    },
    {
      id: "source",
      label: "Source",
      title: "The well, not a flock",
      body: "The source is a hydrocarbon field and the people who run the cracker and the spinning frame. That is a different bio than wool: shift work, solvents, and a fiber that will not rot when the hat is thrown out.",
    },
  ],
  h3: [
    {
      id: "material",
      label: "Material",
      title: "Cotton, with a wide brim",
      body: "A stock bucket is a flat crown and a brim meant to droop. The cloth is usually cotton twill, dense enough to hold the brim's shape and light enough to wear in sun.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "The same plant as a shirt",
      body: "The fiber is cotton, ginned, spun, and woven. Nothing in the hat is exotic. The difference from a tee is the weave and the cut: panels and a brim instead of a tube of jersey.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Mill, then a small sewing line",
      body: "Rolls of twill leave a mill, get cut, and are stitched on a headwear line that also makes caps. Stüssy designs and sells. The sewing floor is a contractor. We do not have the contractor's name for this hat.",
    },
    {
      id: "source",
      label: "Source",
      title: "Cotton country",
      body: "Somewhere a field produced this fiber: irrigated rows, defoliant, a harvest crew or a machine. The hat's public story ends at the brand. The field's story is still missing a name.",
    },
  ],
  t1: [
    {
      id: "material",
      label: "Material",
      title: "Cotton jersey",
      body: "A Uniqlo crew is a light cotton jersey, knitted as a tube of loops so it stretches and lies flat. The collar is a tighter rib. That is the whole garment: yarn, a knit, a hem, a neck.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Combed cotton, mostly",
      body: "The yarn is cotton, often combed so the short fibers are pulled out and the shirt pills less. Uniqlo has bought cotton through Better Cotton and other programs. This listing is not a certificate for the shirt on the figure.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Gin, knitter, sewing line",
      body: "Lint is spun, knitted into jersey, dyed, cut, and sewn. Uniqlo publishes sewing partners across several countries. A crew neck is one of the simplest cuts in that system, which is why it can cost what it costs.",
    },
    {
      id: "source",
      label: "Source",
      title: "The people at the start",
      body: "Before the knit is a farm and a gin. The bio we owe that place is wages, water, and whether the cotton was grown with forced labor in the supply shed. We are not pretending this tee has cleared that bar.",
    },
  ],
  t2: [
    {
      id: "material",
      label: "Material",
      title: "Cotton fleece, turned",
      body: "Reverse Weave is heavy cotton fleece knitted so the structure runs sideways. That is why it is supposed to shrink less in length than a normal sweatshirt. Rib at the cuff, hood or crew, a pouch pocket.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A lot of cotton, loosely knit",
      body: "Fleece uses more cotton per inch than a tee, looped on the inside for air. The fiber is the same plant. The difference is how much of it, and how the loops are brushed or left alone.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "From Rochester's idea to a contract line",
      body: "Champion built Reverse Weave as a shrink-resistant athletic fleece. The shirts are still cotton, knitted, cut, and sewn by contracted plants. The idea is old. The factory for the one on the figure is not on this page.",
    },
    {
      id: "source",
      label: "Source",
      title: "More field per hoodie",
      body: "A heavy fleece asks more of a cotton crop than a tee does: more lint, more dye, more water in the wash. The source bio is a farm scaled up, and a sewing wage we have not seen.",
    },
  ],
  t3: [
    {
      id: "material",
      label: "Material",
      title: "Oxford cloth",
      body: "An oxford button-down is cotton woven in a basket: two fine yarns crossing a heavier one. That is the pebbled face. The collar buttons to the shirt so it stays put under a jacket.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Shirting cotton",
      body: "The yarn is cotton chosen to be smooth enough for a woven shirt, not a knit. It is dyed or left white, then woven wide so the pattern of the basket shows.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "A shirting mill, then a shirt factory",
      body: "Mills weave the cloth. A shirt factory cuts the collar, the placket, the cuffs, and sets the buttons. J.Crew sells the result. Oxford is a slow cut compared with a tee: more seams, more hands.",
    },
    {
      id: "source",
      label: "Source",
      title: "The mill town and the field",
      body: "Two bios sit under this shirt. One is the cotton field. The other is the weaving room, where the basket is made and the wage is for standing at a loom. Neither is named on the tag.",
    },
  ],
  t4: [
    {
      id: "material",
      label: "Material",
      title: "Jersey, then ink",
      body: "The shirt is cotton jersey. The picture on the chest is ink, usually a screen print: a stencil, a squeegee, a cure under heat. The cloth is ordinary. The print is the product.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A blank, and a pigment",
      body: "Someone knits the blank. Someone else grinds the pigment into a paste that will sit on cotton without cracking at the first wash. Those are two materials from two places.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Mill, print shop, drop",
      body: "Blanks are bought, printed in a shop that may not be the brand's, then sold in a short run. Supreme's graphic tees are built on that split: a commodity shirt and a scarce print. We are not showing a logo we do not own.",
    },
    {
      id: "source",
      label: "Source",
      title: "Cotton, plus a printer",
      body: "The source bio splits. The fiber is a farm. The image is a person pulling a squeegee, paid for the run, not for the resale. The shirt's fame is not the same thing as either wage.",
    },
  ],
  b1: [
    {
      id: "material",
      label: "Material",
      title: "Cotton twill, with a little stretch",
      body: "A washed chino is cotton twill, the same diagonal weave as the cap, cut as a trouser. A small share of elastane lets the thigh move. The wash is what makes it look already worn.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Cotton, and a synthetic thread",
      body: "Most of the cloth is cotton. The stretch is elastane, a petroleum fiber spun in thin enough that you feel it only when you sit. Two feedstocks, one pant.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Mill, laundry, tailor line",
      body: "Twill is woven, cut into legs and a waistband, sewn, then washed. Bonobos sells the fit. The laundry is where the color and a lot of the water go. That plant is not named here.",
    },
    {
      id: "source",
      label: "Source",
      title: "A field and a chemical plant",
      body: "The cotton has a farm bio: season, water, harvest. The elastane has a plant bio: a reactor and a shift. A stretch chino is both, even when the tag only says cotton.",
    },
  ],
  b2: [
    {
      id: "material",
      label: "Material",
      title: "Polyester doubleknit",
      body: "Tech Fleece is not cotton. It is a polyester doubleknit, light, with a smooth face and a warmer back. The taper and the cuff are the jogger. The cloth is the technology.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Bottles, or a barrel",
      body: "Polyester is PET. It can be melted from oil or from collected bottles. Nike has moved parts of its polyester toward recycled content. This page does not certify the pair on the figure.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Chip, yarn, knitter, sew",
      body: "Pellets are extruded into yarn, knitted as a double cloth, cut, and sewn with a zip or a waistband. The chain is chemical and then mechanical. There is no gin.",
    },
    {
      id: "source",
      label: "Source",
      title: "A feedstock with a footprint",
      body: "If the yarn is virgin, the source is a refinery. If it is recycled, the source is a sorting line and the people who collect the bottles. Either bio is real. The tag has to say which, and this one has not been opened that far.",
    },
  ],
  b3: [
    {
      id: "material",
      label: "Material",
      title: "Cotton denim, 3x1 twill",
      body: "The 501 is cotton denim: indigo warp, white weft, a diagonal twill, copper rivets, a button fly. The white fade lines are the weft showing through as the indigo wears off.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Cotton, then a dye bath",
      body: "The fiber is cotton. The blue is indigo, synthetic on almost every modern jean, reduced in a bath so it will bite the yarn. The rope-dye and the later laundry are as much the material as the plant.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Mill, laundry, sewing",
      body: "A denim mill weaves the cloth. A laundry washes, softens, and sometimes distresses it, which is where jeans use serious water and chemistry. Then a sewing line sets the rivets. Levi's publishes mill and factory lists. This pair is not matched to a line on that list.",
    },
    {
      id: "source",
      label: "Source",
      title: "The field and the wash house",
      body: "Two places owe a bio. The cotton field, and the laundry, where the finish is made and the water leaves. Levi's has written about both. We have not stood in either for the jeans on this figure.",
    },
  ],
  f1: [
    {
      id: "material",
      label: "Material",
      title: "Calfskin, minimally marked",
      body: "The Achilles low is a leather sneaker with an unbranded face: smooth calfskin, a cup sole, a narrow last. The point of the shoe is the hide and the cut, not a logo.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A hide, then a tannery",
      body: "Leather is the skin of an animal, almost always cattle raised for meat. The hide is a co-product. A tannery turns it from something that would rot into something that can be lasted. That bath is chromium or vegetable tannin.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Hide market, tannery, Italian last",
      body: "Common Projects has said the Original Achilles is made in Italy. Hides are bought, tanned, cut, lasted, and stitched. Italy is the public sewing story. The ranch and the tannery are further back and not on the box.",
    },
    {
      id: "source",
      label: "Source",
      title: "The herd and the pit",
      body: "The bio starts with cattle and the people who handle hides, then the tannery yard. Leather looks quiet on a white shoe. The source is a slaughter co-product and a chemical process. That should be sayable before the price.",
    },
  ],
  f2: [
    {
      id: "material",
      label: "Material",
      title: "Canvas and vulcanized rubber",
      body: "A Chuck Taylor is cotton canvas stitched to a rubber toe cap and a rubber sole, then vulcanized: heat and sulfur lock the rubber. The diamond texture on the sole is the mold.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "A plant, and a tree or a barrel",
      body: "The upper is cotton canvas. The sole is rubber, either tapped from hevea trees or synthesized from petrochemicals. Most modern cup soles are a blend decided by the factory, not by the person buying the shoe.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Mill, rubber room, press",
      body: "Canvas is woven. Rubber is mixed, sheeted, and pressed to the upper in a vulcanizing press. Converse has moved this work across countries for decades. The press that made this pair is not identified here.",
    },
    {
      id: "source",
      label: "Source",
      title: "Cotton rows and a rubber camp",
      body: "If the sole is natural rubber, the source bio is a hevea grove and the people who tap it before dawn. If it is synthetic, the source is a refinery. The canvas half is a cotton field either way.",
    },
  ],
  f3: [
    {
      id: "material",
      label: "Material",
      title: "Suede, mesh, and a foam sole",
      body: "A 574 mixes a suede overlay, a mesh upper, and a chunky sole. Suede is leather split thin and buffed. Mesh is usually polyester. The sole is EVA foam, rubber, or both.",
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "Three feedstocks",
      body: "The suede is a hide. The mesh is a polymer. The foam is a blown plastic. A runner like this is a small assembly of animals, oil, and air.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Tannery, knitter, lasting line",
      body: "Suede is tanned and split. Mesh is knitted. They are stitched, lasted onto the sole, and boxed. New Balance makes some shoes in the US and many elsewhere. A core 574 is not a promise of either.",
    },
    {
      id: "source",
      label: "Source",
      title: "Hide, pellet, and the lasting room",
      body: "The source bio has to include the herd, the resin plant, and the people on the lasting line who pull the upper over the form. The shoe is the sum of those three. The box usually names none of them.",
    },
  ],
};

export function storyFor(item: ClothingItem): StoryLayer[] {
  return STORIES[item.id] ?? fallbackStory(item);
}

function fallbackStory(item: ClothingItem): StoryLayer[] {
  return [
    {
      id: "material",
      label: "Material",
      title: item.name,
      body: `${item.brand} sells this as ${item.name}. The cloth on the figure is a stand-in. The material note belongs to the real piece.`,
    },
    {
      id: "origin",
      label: "Where it comes from",
      title: "The fiber, hide, or resin",
      body: "Every piece starts as a crop, an animal, or a feedstock. This one does not yet say which.",
    },
    {
      id: "supply",
      label: "Supply chain",
      title: "Maker, then brand",
      body: `${item.brand} is the name on the sale. The mill and the sewing floor are the names that matter, and they are not attached yet.`,
    },
    {
      id: "source",
      label: "Source",
      title: "Still unnamed",
      body: "A source bio needs a place and the people there. This partner piece does not have one we are willing to invent.",
    },
  ];
}
